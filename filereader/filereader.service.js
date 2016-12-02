export class FileReaderService {

  constructor($q, $log) {
    'ngInject';

    this.$q = $q;
    this.$log = $log;
  }

  onLoad(reader, deferred, scope) {
    return function() {
      scope.$apply(function() {
        deferred.resolve(reader.result);
      });
    };
  }

  onError(reader, deferred, scope) {
    return function() {
      scope.$apply(function() {
        deferred.reject(reader.result);
      });
    };
  }

  onProgress(reader, scope) {
    return function(event) {
      scope.$broadcast('fileProgress', {
        total: event.total,
        loaded: event.loaded
      });
    };
  }

  getReader(deferred, scope) {
    const reader = new FileReader();
    reader.onload = this.onLoad(reader, deferred, scope);
    reader.onerror = this.onError(reader, deferred, scope);
    reader.onprogress = this.onProgress(reader, scope);
    return reader;
  }

  readAsDataURL(file, scope) {
    const deferred = this.$q.defer();

    const reader = this.getReader(deferred, scope);
    reader.readAsDataURL(file);

    return deferred.promise;
  }

}
