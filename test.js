var assert = require('assert');
var connect = require('connect');
var MedeaStore = require('./')(connect);

var store = new MedeaStore;

store.on('connect', function(){
  // #set()
  store.set('123', { cookie: { maxAge: 2000 }, name: 'tj' }, function(err){
    assert.ok(!err, '#set() got an error');

    // #get()
    store.get('123', function(err, data){
      assert.ok(!err, '#get() got an error');
      assert.deepEqual({ cookie: { maxAge: 2000 }, name: 'tj' }, data);

      // #set null
      store.set('123', { cookie: { maxAge: 2000 }, name: 'tj' }, function(){
        store.destroy('123', function(){
         console.log('done');
         store.client.close(); 
        });
      });
      throw new Error('Error in fn');
    });
  });
});

process.once('uncaughtException', function (err) {
  assert.ok(err.message === 'Error in fn', '#get() catch wrong error');
});
