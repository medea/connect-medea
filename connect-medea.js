var Medea = require('medea')
var msgpack = require('msgpack-js');

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

    this.client = options.client || new Medea(options);
    this.ttl =  options.ttl;

    options.dirname = options.dirname || process.cwd() + '/data';

    this.state = 'opening';
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
      var result = msgpack.decode(data);

      if (result.expires < Date.now()) {
        self.client.remove(sid, function(err) {
          if (err) return fn(err);

          return fn();
        });
        return;
      } 

      return fn(null, JSON.parse(result.data));
    });
  };

  MedeaStore.prototype.set = function(sid, sess, fn){
    sid = this.prefix + sid;
    try {
      var maxAge = sess.cookie.maxAge
        , ttl = this.ttl
        , sess = JSON.stringify(sess);

      ttl = ttl || ('number' == typeof maxAge ? maxAge : oneDay);

      var entry = {
        data: sess,
        expires: Date.now() + ttl
      };

      this.client.put(sid, msgpack.encode(entry), function(err) {
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
