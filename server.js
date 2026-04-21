const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "mysecretkey";

mongoose.connect('mongodb://127.0.0.1:27017/taskdb');

const User = mongoose.model('User',{username:String,password:String});
const Task = mongoose.model('Task',{title:String,status:String,user:String});

app.post('/register', async (req,res)=>{
  const user = new User(req.body);
  await user.save();
  res.json({msg:"Registered"});
});

app.post('/login', async (req,res)=>{
  const user = await User.findOne(req.body);
  if(!user) return res.json({msg:"Invalid"});
  const token = jwt.sign({username:user.username}, SECRET);
  res.json({token});
});

function auth(req,res,next){
  const token = req.headers.authorization;
  if(!token) return res.sendStatus(401);
  try{
    const data = jwt.verify(token, SECRET);
    req.user = data;
    next();
  }catch{
    res.sendStatus(403);
  }
}

app.get('/tasks', auth, async (req,res)=>{
  res.json(await Task.find({user:req.user.username}));
});

app.post('/tasks', auth, async (req,res)=>{
  const task = new Task({...req.body, user:req.user.username});
  await task.save();
  res.json(task);
});

app.listen(5000, ()=>console.log("Server running"));
