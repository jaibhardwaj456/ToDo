//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const mongoLink = 'mongodb+srv://toDoList:OCWmh9lI8xh3WweF@cluster0.mti9kp7.mongodb.net/?retryWrites=true&w=majority'
mongoose.connect(mongoLink);

// OCWmh9lI8xh3WweF

const itemSchema = {
  name:String
};

const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
  name: "Welcome to todolist!"
});
const item2 = new Item({
  name: "Hit the + button of add a new item"
});
const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems = [item1,item2,item3];

const ListSchema = {
  name: String,
  item: [itemSchema]
};

const List = mongoose.model("List",ListSchema)





app.get("/", function(req, res) {

  Item.find().then((presentItems)=>{
    console.log("Succesfully found Items in DB.");
    if(presentItems.length===0){
      Item.insertMany(defaultItems).then(()=>{
        console.log("Succesfully saved defaultItems to DB.");
      }).catch((err)=>{
        console.log(err);
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: presentItems});
    }
    
  }).catch((err)=>{
    console.log(err);
  })

  

});

app.get("/:customListName",(req,res)=>{
  const customListName = req.params.customListName;

  
  List.findOne({name:customListName}).then((foundList)=>{
    if(!foundList){
      const list = new List({
        name:customListName,
        item: defaultItems
      });
      list.save();
      
      res.redirect("/"+customListName);
    }
    else{
      res.render("list",{listTitle: foundList.name, newListItems: foundList.item})
      
    }
  }).catch((err)=>{
    console.log(err);
  })
  

})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  })
  if(listName==="Today")
  {
    item.save();

  res.redirect("/")
  }
  else{
    List.findOne({name:listName}).then((list)=>{
      list.item.push(item)
      list.save();

      res.redirect("/"+listName);
    })
  }
  
  
});

app.post("/delete", (req,res)=>{
  const itemId = req.body.check;

  Item.findByIdAndDelete(itemId).then(()=>{
    console.log("Item is deleted")
    res.redirect("/")
  }).catch((err)=>{
    console.log(err)
  });
  
})
app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
