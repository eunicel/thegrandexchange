/* Item Model */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// item schema
var itemSchema = mongoose.Schema({
  name: String,
  description: String,
  offers: [{type: ObjectId, ref: 'Offer'}]
});

// GET - returns all items
itemSchema.statics.getItems = function(callback){
  Item.find({}, function(err, items){
    if(err){
      throw err;
    } else {
      callback(items);
    }
  });
}

// POST - create new item
itemSchema.statics.createItem = function(name, description, callback){
  var item = new Item({
    name: name,
    description: description,
    offers: []
  });
  item.save(function(err, item){
    callback(item);
  });
}

// GET - get item by id
itemSchema.statics.getItemById = function(item_id, callback){
  Item.findOne({_id:item_id}, function (err, item){
    if (err) {
      throw err;
    } else {
      callback(item);
    }
  });
}

// GET - get offers of item
itemSchema.statics.getItemOffers = function(item_id, callback){
 Item.findOne({_id:item_id}, function (err, item){
  if (err) {
    throw err;
  } else {
    var offers = item.offers;
    callback(offers);
  }
 });
}

// PUT - adds offer to item
itemSchema.statics.addOfferToItem = function(offer, item_id, callback){
  Item.findOne({_id:item_id}, function(err, item){
    if(err){
      throw err;
    } else {
      item.offers.push(offer);
    }
    items.save(function(err, item){
      callback(item);
    });
  });
}

// create model
var Item = mongoose.model('Item', itemSchema);

// export
module.exports = Item;


