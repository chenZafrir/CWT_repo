import { Response, Request } from "express";
import express from "express"; 

const app = express();
const bodyParser = require('body-parser');
var cache_instance : Cache = null;

class Cache{
    public memory:any;
    private maxItems:number=0;
    private orderedItemsByLastTocuhed:Array<string> = [];

    constructor(_maxItems:number){
        this.memory = {};
        this.maxItems = _maxItems;
    }

    public get(key: string){
        if(this.memory[key]){
            this.updateTimeOfKey(key);
            return this.memory[key];
        }else{
            return undefined;
        }
    }

    public set(key: string, value: string){
        if(!this.memory[key] && this.maxItems <= Object.keys(this.memory).length){
            let oldestKey = this.orderedItemsByLastTocuhed[0];
            delete this.memory[oldestKey];
            this.memory[key] = value;
            this.orderedItemsByLastTocuhed.splice(0,1);
        }else{
            this.memory[key] = value;
        }
        this.updateTimeOfKey(key);
    }

    public toObject(){
        console.log(this.memory);
    }

    public updateTimeOfKey(key){
        let index = this.orderedItemsByLastTocuhed.findIndex(el => el == key);
        if(index>-1){
            this.orderedItemsByLastTocuhed.splice(index,1);
            this.orderedItemsByLastTocuhed.push(key);
        }else{
            this.orderedItemsByLastTocuhed.push(key);
        }
    }
}

app.listen(8080, ()=>{
   console.log('I am listening on 8080'); 
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.post('/createCache',(req:Request, res:Response )=>{
    cache_instance = new Cache(3);
    res.send(cache_instance);
})

app.get('/getCacheKey',(req:Request, res:Response )=>{
    let query_param:any = req.query.key
    let possible_value = cache_instance.get(query_param);
    let value = possible_value ? possible_value : null;
    res.json(value);
})

app.post('/setCacheKey',(req:Request, res:Response )=>{
    cache_instance.set(req.body['key'],req.body['value']);
    res.send(cache_instance);
})

app.post('/print',(req:Request, res:Response )=>{
    cache_instance.toObject();
    res.send('Was printed');
})