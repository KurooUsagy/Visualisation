import History from "./history.mjs";
import Radar from "./radar.mjs";
import Spider from "./spider.mjs";

var w = 200;
var h = 200;
var authorCount = [];
var datarows;
var minAuthorCount;
var maxAuthorCount;
var titleLength = [];
var minTitleLength;
var maxTitleLength;
var splitfactor = 3;
var autor_name;
let table;
function preload() {
    table = loadTable("../data/authors-affiliations-cleaned-March-25-2019.csv","csv","header");
}

function setup() {
    loadTable('../data/IEEE VIS papers 1990-2018 - Main dataset.csv', 'csv', 'header', function (t) {
        console.log(t);
        for (let i = 0; i < 30; i++) {
            const li = document.createElement("li");
            li.innerText = `${t.getString(i, "Title")} -- ${t.getString(i, "Year")}`;
            li.style.color = ["blue", "green", "red"][Math.floor(Math.random()*4)];
            document.getElementById("works").append(li);
        }
    });
    createCanvas(0,0);

    console.log(table);
    var autor_list = table.getColumn(2);
    console.log(autor_list);
    autor_list = [...new Set(autor_list)];
    console.log(autor_list);

    var posX = windowWidth/splitfactor;


    var history = new History(200,800,0, 0);
    var radar = new Radar(400,800,0, 200);
    var spider = new Spider(400,800,0, 400);

    var s1 = new p5(function(p5){
        p5.preload = function(){
            history.preload(p5);
        };
        p5.setup = function(){
            history.setup(p5);
        };
        p5.draw = function(){
            history.draw(p5);
        }
    });

    var s2 = new p5(function(p5){
        p5.setup = function(){
            radar.setup(p5);
        };
        p5.draw = function(){
            radar.draw(p5);
        }
    });
    var s3 = new p5(function(p5){
        p5.preload = function(){
            spider.preload(p5);
        }
        p5.setup = function(){
            spider.setup(p5);
        };
        p5.draw = function(){
            spider.draw(p5);
        }
    });

    var input =  document.querySelector("#search");
    input.addEventListener("change", (event) => {
        autor_name = input.value;
        spider.change_autor(autor_name);
    });

}

function myInputEvent(event) {
    console.log('you are typing: ', event.value);
    saveCanvas();
}

function draw() {
}

window.setup = setup;
window.preload = preload;
window.draw = draw;