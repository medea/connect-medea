var medea = require('medea')
var ttl = require('medea-ttl');

var oneDay = 86400;

module.exports = function(connect){

  var Store = connect.session.Store;

  function MedeaStore(options) {
    var self = this;

    options = options || {};
    Store.call(this, options);
    this.prefix = null == options.prefix
      ? 'sess:'
      : options.prefix;

    this.client = ttl(options.client || medea(options));
    this.ttl =  options.ttl;

    options.dirname = options.dirname || process.cwd() + '/data';

    this.client.open(options.dirname, function(err) {
      if (err) {
        this.emit('disconnect');
        throw err;
        return;
      }

      self.emit('connect');
    });
  };

  MedeaStore.prototype.__proto__ = Store.prototype;

  MedeaStore.prototype.get = function(sid, fn){
    var self = this;
    sid = this.prefix + sid;
    this.client.get(sid, function(err, data){
      if (err) return fn(err);
      if (!data) return fn();
      var result;
      data = data.toString();

      try {
        result = JSON.parse(data);
      } catch (err) {
        return fn(err);
      }

      return fn(null, result);
    });
  };

  MedeaStore.prototype.set = function(sid, sess, fn){
    sid = this.prefix + sid;
    try {
      var maxAge = sess.cookie.maxAge
        , ttl = this.ttl
        , sess = JSON.stringify(sess);

      ttl = ttl || ('number' == typeof maxAge ? maxAge : oneDay);

      this.client.put(sid, sess, ttl, function(err) {
        fn && fn.apply(this, arguments);
      });
    } catch (err) {
      fn && fn(err);
    } 
  };

  MedeaStore.prototype.destroy = function(sid, fn){
    sid = this.prefix + sid;
    this.client.remove(sid, fn);
  };

  return MedeaStore;
};
