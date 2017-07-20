'use strict';

import urlPackage from 'url';
import CONFIG from '../config.js';
import CONSTANTS from '../constants.js';

import { trackConfirmation, trackUser, trackInstall } from '../mixpanel.js';
import { getUser, fetchConfirmationList, fetchData } from './kardApi.js';
import { emptyData, tabState, msgObj } from './defaultDataSet.js';
import {
  forceLogOut,
  sendMsgToContentScript,
  removeLocalStorageItems,
  filterUniqueBank,
  barclaysArrivalCard,
  findBarclayArrival
} from './util.js';

const SERVER = CONFIG.server;

let activeTabId = 0;
let browserTabTable = {};
let newCards = [];
let listForConfirmation = {};
let loggedUser;
let AFSRCFOUND;

const checkLoggedUser = () => (localStorage.getItem('token')) ? true : false;

const initMx = (user) => trackUser(user);

const checkOldUsers = () => {
  return forceLogOut();
}();

const initScript = () => {
  if (checkLoggedUser()) {
    return Promise.all([getUser(), fetchConfirmationList()])
      .then(([user, confirmationList]) => {
        loggedUser = user.data.user
        listForConfirmation = confirmationList.data;
        initMx(loggedUser);
      })
      .catch((err) => console.info(err));
  }
}();

const handleError = (err) => console.info('Error => promiseApi error', err);

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
  browserTabTable[tabId].standDown = false;
  return res;
}

const displayBrowserBadge = (data) => {
  const { kardOffers, syncedOffers, tabId } = data;
  let offerCount = kardOffers.offers.length + syncedOffers.offers.length;
  let displayNumber = (offerCount) ? offerCount.toString() : '';
  browserTabTable[tabId].badgeText = displayNumber;
  chrome.browserAction.setBadgeText({ text: displayNumber, tabId: tabId });
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
  const blockedUrl = CONSTANTS.BLOCKED_URL;
  const parsed = urlPackage.parse(url);
  return (parsed && blockedUrl.indexOf(parsed.hostname) > -1) ? true : false;
}

const queryObj = (tabId, apiUrl, activeUrl, banks) => {
  const user = loggedUser;
  let params = { domain: activeUrl, banks: banks, tabId: tabId, from: 'extension' };
  if (user && apiUrl === `/synced/getSyncedOffers`) {
    params.userId = user._id;
  }
  return params;
}

const dataApi = (tabId, apiUrl, activeUrl, banks) => {
  let paramsObj = queryObj(tabId, apiUrl, activeUrl, banks);
  return fetchData(apiUrl, paramsObj);
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
    // const apiUrl = localStorage.getItem('token') ? '/offers' : '/offers/count';
    const apiUrl = '/offers';
    const user = loggedUser;
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
      let singlePromise = dataApi(tabId, syncedUrl, activeUrl, barclaysCard);
      return promiseApi([singlePromise]);
    }
    if (user && !user.pilot) {
      let singlePromise = dataApi(tabId, apiUrl, activeUrl, cards);
      return promiseApi([singlePromise]);
    }
  }
}

const showSuccessNotification = (url) => {
  if (new URL(url).origin == `${SERVER}`) {
    return false
  }
  const kardSyncedID = 7997622;
  let matched = url.match(/(kard)|(Kard)|(7997622)|(4689368)|(10737101)|(311675)|(42240)|(42444)|(Ui2CR3a3p74)|(42380)|(3Azz0M0aDzoxUkhT5txLQRkVz80)|(728963)|(10666803)|(10579)|(5311)|(46157)|(D17AFFIL)|(11131426)|(42328)/gi)
    // let matched = url.match(/(synced.getShortLink.)/gi);
  return (matched) ? true : false;
}

const checkConfirmationURLList = (tabs) => {
  const urlParsed = urlPackage.parse(tabs.url);
  const user = loggedUser;
  if (listForConfirmation[urlParsed.host] == (urlParsed.pathname||urlParsed.path) || (urlParsed.pathname.match(/(confirmation)|(complete)$/mig)) || (urlParsed.pathname.match(/(COSummary-Submit)/mig))) {
    return trackConfirmation(user.email, user._id, tabs.url);
  } else {
    return false;
  }
}

const foundAfsrc = (url) => {
  let answer = url.match(/(afsrc=1)|(www.apmebf.com)|(www.anrdoezrs.net)|(www.commission-junction.com)|(www.dpbolvw.net)|(www.jdoqocy.com)|(www.kqzyfj.com)|(www.qksrv.net)|(www.tkqlhce.com)|(www.qksz.net)|(www.emjcd.com)|(www.afcyhf.com)|(www.awltovhc.com)|(www.ftjcfx.com)|(www.lduhtrp.net)|(www.tqlkg.com)|(www.awxibrm.com)|(www.cualbr.com)|(www.rnsfpw.net)|(www.vofzpwh.com)|(www.yceml.net)|(www.cj.com)/gi)
  if (answer == null) {
    return false
  } else {
    AFSRCFOUND = true
    return true;
  }
}

//new chrome version broke oncreated and onactivated function for starting up
chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
  if(tabs[0].id){
  const tabId = tabs[0].id;
  activeTabId = tabId;
  if (!browserTabTable[tabId]) {
    browserTabTable[tabId] = tabState();
    sendMsgToContentScript(tabId, { tabId: tabId });
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
  }
}
});

chrome.tabs.onCreated.addListener((tab) => {
  const { id } = tab;
  activeTabId = id;
  if (!browserTabTable[id]) {
    browserTabTable[id] = tabState();
    return sendMsgToContentScript(id, { tabId: id });
  }
})

//begining of webrequest if AFSRC found and there is no GOTOLINK then standdown = true
chrome.webRequest.onBeforeRedirect.addListener(function(details) {
  let parsedURL = urlPackage.parse(details.redirectUrl);
  if (foundAfsrc(parsedURL.host) && !browserTabTable[activeTabId].goingToLink) {
    browserTabTable[activeTabId].standDown = true;
  };
}, {
  urls: ["<all_urls>"]
}, ["responseHeaders"]);
// end of webrequest

chrome.tabs.onActivated.addListener((tab, changeInfo) => {
  chrome.tabs.get(tab.tabId, (currentActiveTab) => {
    const { tabId } = tab;
    const activeUrl = currentActiveTab.url;
    activeTabId = tabId;

    if (browserTabTable[tabId] && browserTabTable[tabId].standDown) {
      return;
    } else {
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
    }
  })
})

chrome.idle.onStateChanged.addListener(() => fetchConfirmationList());

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const { url } = tab;
  const hostname = new URL(url).origin;
  const checkStoreName = hostname.split('.')[1];
  // const hhh = hostname.replace('www.','').replace('.com', '');
  let currentTabUrl = browserTabTable[tabId].url;

  //if we see redirect or going to link = true, show offer
  if (changeInfo.status == 'complete' && (AFSRCFOUND || browserTabTable[tabId].goingToLink)) {
    AFSRCFOUND = false;
    browserTabTable[tabId].goingToLink = false;
    sendMsgToContentScript(tabId, { offeractivated: true })
  }

  if (browserTabTable[activeTabId].standDown) {
      browserTabTable[tabId].standDown = false;
      browserTabTable[tabId].url = hostname;
      return;
  }

  if (changeInfo.status === 'loading') {
    chrome.browserAction.setBadgeText({ text: browserTabTable[tabId].badgeText, tabId: tabId });
    checkConfirmationURLList(tab);
  }

  //webapp links that has URL id will show success notifications
  if (currentTabUrl !== "newtab" && currentTabUrl !== hostname && currentTabUrl.indexOf(checkStoreName) < 0 && changeInfo.status === 'complete') {
    browserTabTable[tabId].url = hostname;
    sendMsgToContentScript(tabId, { tabId: tabId });
    updateExtensionData(tabId, url);
    if (showSuccessNotification(url)) {
      sendMsgToContentScript(tabId, { offeractivated: true })
      browserTabTable[tabId].goingToLink = false;
      AFSRCFOUND = false;
    }
  }

  let msg = msgObj(tabId);
  if (currentTabUrl === hostname && changeInfo.status === 'complete') {
    msg.showNotification = (browserTabTable[tabId].notification && !browserTabTable[tabId].standDown) ? true : false;
    chrome.browserAction.setBadgeText({ text: browserTabTable[tabId].badgeText, tabId: tabId });
    return sendMsgToContentScript(tabId, msg);
  }
})

//when tab is closed delete the property for proper garbage collection
chrome.tabs.onRemoved.addListener((tabId) => delete browserTabTable[tabId]);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.command) {
    case 'goingToLink': {
      const { tabId, linkClicked } = request;
      browserTabTable[tabId].goingToLink = linkClicked;
      break;
    }
    case 'loginFromWebApp': {
      const { user } = request;
      localStorage.setItem('token', user.token);
      loggedUser = user;
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
      sendResponse({ user: loggedUser });
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
      const { tabId, closeNotification } = request;
      browserTabTable[tabId].notification = closeNotification;
      break;
    }
  }
});

// renders content script menu
chrome.browserAction.onClicked.addListener((tab) => sendMsgToContentScript(tab.id, { render: true }));

chrome.runtime.onInstalled.addListener((details) => {
    trackInstall();
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
  });
});

chrome.runtime.setUninstallURL(`${SERVER}/exitsurvey`, () => {});
