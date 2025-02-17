/*
With insipiration from https://github.com/phildp/word-cloud
 */

let wordCloud = [];
async function getWords() {
    wordCloud.sort((a, b) => {
        return a.weight - b.weight;
    });
    return wordCloud.filter((value, index) => {
        return index < 35;
    });
}

class Word {
    constructor(x, y, w, h, text, weight) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.text = text;
        this.weight = weight;
    }
}

class WordCloud {
    constructor(h, w, x, y) {
        this.h = h;
        this.w = w;
        this.x = x;
        this.y = y;
    }

    preload(p5) {
        this.table = p5.loadTable("data/IEEE VIS papers 1990-2018 - Main dataset.csv", "csv", 'header');
        this.stopWords = p5.loadStrings("data/stop_words.txt");
    }

    setup(p5) {
        this.p5 = p5;
        this.years = this.table.getColumn("Year").filter((value, index, array) => {
            return array.lastIndexOf(value) === index;
        });
        this.years.sort();
        const c = p5.createCanvas(this.w, this.h);
        p5.noLoop();
        c.parent("canvas2");
        this.slider = document.getElementById("slider");
        this.slider.addEventListener("change", () => {
            this.update(this.slider.value);
        });
        this.ticks = document.getElementById("ticks");
    }

    setAuthor(author) {
        const years = [];
        const keywords = [];
        const weightedKeywords = {};
        this.max_year = {};
        this.min_year = {};
        for (let year of this.years) {
            this.max_year[year] = 0;
            this.min_year[year] = 10000;
            const rows = this.table.findRows(year, "Year");
            for (let row of rows) {
                let authors = row.getString("AuthorNames-Deduped").split(";").concat(row.getString("AuthorNames").split(";"));
                if (!authors.includes(author)) {
                    continue;
                }
                if (years.indexOf(year) === -1) {
                    years.push(year);
                }
                let abstract = row.getString('Abstract');
                abstract = abstract.replace(".", " ").replace(",", " ");
                const words = abstract.split(/(\s|\W)+/i);
                for (const word of words) {
                    if (word.length > 3) {
                        if(!this.stopWords.includes(word)) {
                            keywords.push(word.toLowerCase());
                        }
                    }
                }
            }
            const weightedKeywordsPerYear = [];
            for (const word of keywords) {
                let count = 0;
                for (let dupe of keywords) {
                    if (dupe === word) {
                        count++;
                    }
                }
                const index = keywords.findIndex(value => {
                    return value.word === word;
                });
                if (index === -1) {
                    let weight = count / keywords.length;
                    this.max_year[year] = Math.max(this.max_year[year] , weight);
                    this.min_year[year] = Math.min(this.min_year[year] , weight);
                    weightedKeywordsPerYear.push({word: word, weight: weight});
                }
            }
            weightedKeywords[year] = weightedKeywordsPerYear;
        }
        this.slider.min = years[0];
        this.slider.max = years[years.length - 1];
        this.slider.value = years[years.length - 1];
        this.ticks.childNodes.forEach(value => {
            this.ticks.removeChild(value);
        });
        for (const year of years) {
            const option = document.createElement("option");
            option.innerHTML = year;
            this.ticks.append(option);
        }
        this.words = weightedKeywords;
        this.year = 0;
        this.update(years[years.length - 1]);
    }

    update(year) {
        if (year === undefined || year === this.year) {
            return
        }
        this.year = year;
        document.getElementById("slider-label").innerText = year;
        wordCloud = [];
        let words = [];
        for (const y in this.words) {
            if (this.words.hasOwnProperty(y) && y <= year) {
                words = words.concat(this.words[y]);
            }
        }
        if (!words) {
            return;
        }
        for (let word of words) {
            if (!word.word) {
                continue;
            }
            const index = wordCloud.findIndex(value => {
                return value.text === word.word;
            });
            if (index > -1) {
                wordCloud[index].weight += word.weight;
            } else {
                const x = Math.random() * 100;
                const y = Math.random() * 100;
                wordCloud.push(new Word(x, y, 0, 0, word.word, word.weight));
            }
        }
        this.p5.redraw();
    }

    isOverlapping(x, y, size, width, drawnWords) {

        for (let i = 0; i < drawnWords.length; i++) {
            this.p5.textSize(drawnWords[i].h);
            const oWidth = this.p5.textWidth(drawnWords[i].text);

            if(x > drawnWords[i].x && x < drawnWords[i].x + drawnWords[i].w && y > drawnWords[i].y && y < drawnWords[i].h + drawnWords[i].y){
                return true;
            }
            if(x + width > drawnWords[i].x && x + width < drawnWords[i].x + drawnWords[i].w && y > drawnWords[i].y && y < drawnWords[i].h + drawnWords[i].y){
                return true;
            }
            if(x + width > drawnWords[i].x && x + width < drawnWords[i].x + drawnWords[i].w && y + size > drawnWords[i].y && y + size < drawnWords[i].h + drawnWords[i].y){
                return true;
            }
            if(x > drawnWords[i].x && x < drawnWords[i].x + drawnWords[i].w && y + size > drawnWords[i].y && y + size < drawnWords[i].h + drawnWords[i].y){
                return true;
            }
        }
        return false;
    }

    draw(p5) {
        p5.background(255);
        p5.rect(0, 0, this.w - 2, this.h - 2, 20);
        p5.stroke(0);
        p5.noFill();
        getWords().then(words => {
            p5.textAlign(p5.CENTER);
            let width = 0;
            const drawnWords = [];
            for (let data of words) {
                if (!data.text) {
                    continue;
                }
                let iterations = 0;
                let overlap = true;
                let word;
                do {
                    iterations++;
                    const size = p5.map(data.weight, this.min_year[this.year], this.max_year[this.year], 15, 100);
                    p5.textSize(size);
                    width = p5.textWidth(data.text);
                    const x = p5.random(width + 10 , this.w - width - 10);
                    const y = p5.random(size + 10, this.h - size - 10);

                    overlap = this.isOverlapping(x, y, size, width, drawnWords);
                    word = new Word(x, y, width, size, data.text, data.weight);
                } while (iterations < 5000 && (overlap));
                p5.textSize(word.h);
                p5.text(word.text, word.x, word.y);
                drawnWords.push(word);
            }
        });
    }
}
