'use strict';

import axios from 'axios';
import urlPackage from 'url';
import config from '../config.js';
import { trackConfirmation, trackUser, trackInstall } from '../mixpanel.js'

const SERVER = config.server;

const portals = ['cardlytics.com', 'barclaycardrewardsboost.com', 'discover.com', 'bonuscashcenter.citicards.com', 'bankofamerica.com', 'amexoffers.com', 'chase.com'];

let activeTabId = 0;
let browserTabTable = {};
let newCards = [];
let listForConfirmation = {};

const initMx = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user) {
    return trackUser(user);
  }
}

//fetches list of confirmation url
const fetchConfirmationList = () => {
  axios.get(`${SERVER}/kardOffers/getConfirmation`)
    .then((res) => {
      listForConfirmation = res.data;
    })
    .catch((err) => console.log(err))
}

const initScript = () => {
  initMx();
  fetchConfirmationList();
}();

const handleError = (err) => console.info('Error => promiseApi error');

const sendMsgToContentScript = (tabId, obj) => chrome.tabs.sendMessage(tabId, obj);

const filterUniqueBank = (user) => (user) ? [...new Set(user.cards.map(card => card.bank))] : [];

const barclaysArrivalCard = (card) => card.name === "Barclaycard Arrival Plus™ World Elite MasterCard®";

const findBarclayArrival = (cardArray) => cardArray.some(barclaysArrivalCard);

const emptyData = (tabId) => {
  return {
    kardOffers: { offers: [] },
    syncedOffers: { offers: [] },
    tabId: tabId || ""
  }
}

const setDataNoOffers = (tabId) => {
  const data = emptyData(tabId);
  browserTabTable[tabId]['kardData'] = data.kardOffers;
  browserTabTable[tabId]['syncedData'] = data.syncedOffers;
  return displayBrowserBadge(data);
}

const sortDataObj = (dataResponse) => {
  let newDataObj = emptyData();
  dataResponse.map(idx => {
    if (idx.data.kardOffers) {
      newDataObj.kardOffers = idx.data;
      newDataObj.tabId = idx.data.tabId;
    }
    if (idx.data.syncedOffers) {
      newDataObj.syncedOffers = idx.data;
      newDataObj.tabId = idx.data.tabId;
    }
  })
  return newDataObj;
}

const setTabData = (res) => {
  const { syncedOffers, kardOffers, tabId } = res;
  browserTabTable[tabId]['kardData'] = kardOffers;
  browserTabTable[tabId]['syncedData'] = syncedOffers;
  browserTabTable[tabId].notification = true;
  return res;
}

const displayBrowserBadge = (data) => {
  const { kardOffers, syncedOffers, tabId } = data;
  let offerCount = kardOffers.offers.length + syncedOffers.offers.length;
  let displayNumber = (offerCount) ? offerCount.toString() : '';
  chrome.browserAction.setBadgeText({ text: displayNumber, tabId: tabId});
  return data;
}

const updateClientSideData = (data) => {
  const { syncedOffers, kardOffers, tabId } = data;
  const msgObj = {
    updateContentScriptData: true,
    updateNotification: true,
    showNotification: true,
    syncedOffers: syncedOffers.offers,
    kardOffers: kardOffers.offers
  }
  return sendMsgToContentScript(tabId, msgObj);
}

const checkForBlockedUrl = (url) => {
  const blocked = ['extensions', 'newtab', 'www.google.com', 'mail.google.com', 'calendar.google.com', 'www.twitter.com', 'www.facebook.com', 'www.messenger.com', 'inbox.google.com', 'www.reddit.com'];
  const parsed = urlPackage.parse(url);
  return (parsed && blocked.indexOf(parsed.hostname) > -1) ? true : false;
}

const queryObj = (tabId, apiUrl, activeUrl, banks) => {
  const user = JSON.parse(localStorage.getItem('user'));
  let params = { domain: activeUrl, banks: banks, tabId: tabId };
  if (user && apiUrl === `/synced/getSyncedOffers`) {
    params.userId = user._id;
    params.userEmail = user.email;
  }
  return params;
}

const dataApi = (tabId, apiUrl, activeUrl, banks) => {
  let paramsObj = queryObj(tabId, apiUrl, activeUrl, banks);
  return axios({
      method: 'get',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      url: `${SERVER}${apiUrl}`,
      params: paramsObj
    })
}

const promiseApi = (promises) => {
  return Promise.all(promises)
          .then(sortDataObj)
          .then(setTabData)
          .then(displayBrowserBadge)
          .then(updateClientSideData)
          .catch(handleError)
}

//need to refactor this after piping out localStorage
const updateExtensionData = (tabId, activeUrl) => {
  if (checkForBlockedUrl(activeUrl)) {
    return setDataNoOffers(tabId);
  } else {
    const apiUrl = localStorage.getItem('token') ? '/offers' : '/offers/count';
    const user = JSON.parse(localStorage.getItem('user'));
    const cards = filterUniqueBank(user);
    const barclaysCard = cards.filter((card) => card === 'Barclays');
    const otherCards = cards.filter((card) => card !== 'Barclays');
    if (user && user.pilot) {
      const syncedUrl = `/synced/getSyncedOffers`;
      if (otherCards.length) {
        const urls = [apiUrl, syncedUrl];
        let promises = urls.map((url) => dataApi(tabId, url, activeUrl, otherCards));
        return promiseApi(promises);
      }
      let singlePromise = dataApi(tabId, syncedUrl, activeUrl, otherCards);
      return promiseApi([singlePromise]);
    } else {
      let singlePromise = dataApi(tabId, apiUrl, activeUrl, cards);
      return promiseApi([singlePromise]);
    }
  }
}

const removeLocalStorageItems = (items) => {
  const listOfItems = items;
  return listOfItems.forEach((idx) => localStorage.removeItem(idx));
}

const showSucessNotification = (url) => {
  const kardSyncedID = 7997622;
  let answer = url.match(/(kard)|(Kard)|(source=cj)|(CJ)|(ranSiteID)|(linkshare)|(7997622)/gi)
  return (answer) ? true : false;
}

const tabState = () => {
  return {
    url: "",
    syncedData: null,
    kardData: null,
    notification: null,
    cards: []
  }
}

const msgObj = (id) => {
  return {
    tabId: id,
    updateContentScriptData: true,
    updateNotification: true,
    showNotification: null
  }
}

const checkConfirmationURLList = (tabs) => {
  const urlParsed = urlPackage.parse(tabs.url);
  const user = JSON.parse(localStorage.getItem('user'));
  if (listForConfirmation[urlParsed.host] == urlParsed.pathname || (urlParsed.pathname.match(/(confirmation|complete)$/mig)) || (urlParsed.pathname.match(/(COSummary-Submit)/mig))) {
    return trackConfirmation(user.email, tabs.url);
  }
}

chrome.tabs.onCreated.addListener((tab) => {
  const { id } = tab;
  browserTabTable[id] = tabState();
  return sendMsgToContentScript(id, { tabId: id });
})

chrome.tabs.onActivated.addListener((tab, changeInfo) => {
  chrome.tabs.get(tab.tabId, (currentActiveTab) => {
    const { tabId } = tab;
    const activeUrl = currentActiveTab.url;
    activeTabId = tabId;

    if (!browserTabTable[tabId]) {
      browserTabTable[tabId] = tabState();
    }

    let newCardsList = newCards.sort().toString();
    let oldCardsList = browserTabTable[tabId].cards.sort().toString();
    if (newCardsList !== oldCardsList) {
      browserTabTable[tabId].cards = newCards;
      updateExtensionData(tabId, activeUrl);
    }

    if (browserTabTable[tabId]) {
      let msg = msgObj(tabId);
      msg.showNotification = (browserTabTable[tabId].notification) ? true : false;
      sendMsgToContentScript(tabId, msg);
    }

  })
})

chrome.idle.onStateChanged.addListener(() => fetchConfirmationList());

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const { url } = tab;
  const hostname = new URL(url).hostname;

  if (changeInfo.status === 'loading') {
    checkConfirmationURLList(tab);
  }

  if (browserTabTable[tabId].url !== hostname && hostname !== "newtab" && changeInfo.status === 'complete') {
    browserTabTable[tabId].url = hostname;
    sendMsgToContentScript(tabId, { tabId: tabId });
    updateExtensionData(tabId, url);
    return (showSucessNotification(url)) ? sendMsgToContentScript(tabId, { offeractivated: true }) : "";
  }

  let msg = msgObj(tabId);
  if (browserTabTable[tabId].url === hostname && changeInfo.status === 'complete') {
    msg.showNotification = (browserTabTable[tabId].notification) ? true : false;
    return sendMsgToContentScript(tabId, msg);
  }
})

//when tab is closed delete the property for proper garbage collection
chrome.tabs.onRemoved.addListener((tabId) => {
  return delete browserTabTable[tabId];
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.command) {
    case 'loginFromWebApp': {
      const { user } = request;
      localStorage.setItem('token', user.token);
      localStorage.setItem('user', JSON.stringify(user));
      newCards = filterUniqueBank(user);
      break;
    }
    case 'getKardData': {
      const data = browserTabTable[activeTabId].kardData;
      sendResponse({ data });
      break;
    }
    case 'getSyncedData': {
      const data = browserTabTable[activeTabId].syncedData;
      sendResponse({ data });
      break;
    }
    case 'deleteBankingPortalLink': {
      removeLocalStorageItems(['KardExtensionBankingPortalLink']);
      break;
    }
    case 'getUser': {
      sendResponse({ user: JSON.parse(localStorage.getItem('user')) });
      break;
    }
    case 'transition': {
      const portal = localStorage.getItem('KardExtensionBankingPortalLink');
      sendResponse({ portal });
      break;
    }
    case 'setTransitionUrl': {
      const { transitionUrl } = request;
      localStorage.setItem("KardExtensionBankingPortalLink", transitionUrl);
      break;
    }
    case 'setNotification': {
      const { tabId, showNotification } = request;
      browserTabTable[tabId].notification = showNotification;
      break;
    }
  }
});

// renders content script menu
chrome.browserAction.onClicked.addListener((tab) => sendMsgToContentScript(tab.id, { render: true }));

chrome.runtime.onInstalled.addListener((details) => {
  chrome.windows.getCurrent({ populate: true }, (winObj) => {
    let active = '';
    let currentUrl;
    let tabs = winObj.tabs;
    for (let i = 0; i < tabs.length; i++) {
      if (tabs[i].active === true) {
        active = tabs[i];
        currentUrl = active.url;
      }
    }
    const install = details.reason;
    if (install === 'install' && currentUrl.indexOf('/dashboard/deals') > -1 || install === 'install' && currentUrl.indexOf('/onboard') > -1) {
      chrome.tabs.reload();
    } else if (details.reason === 'install' && currentUrl.indexOf('webstore') > -1) {
      chrome.tabs.create({ url: `${SERVER}/signup` });
    }
    trackInstall();
  });
});

chrome.runtime.setUninstallURL(`${SERVER}/exitsurvey`, () => {});
