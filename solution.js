const request = require('request');
const cheerio = require('cheerio');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require("fs"));
const url = 'https://www.cermati.com';
const url_2 = 'https://www.cermati.com/artikel';


function parse(){
    return new Promise(function(resolve, reject){
        request(url_2, function (error, response, body) {
            // in addition to parsing the value, deal with possible errors
            if (error) return reject(error);
            try {
                const $ = cheerio.load(body);
                const links_solutions = [];

                $('.article-list-item').each((i,element)=> {
                    const link = $(element).find('a').attr('href');
                    const link_new = `${url}${link}`;
                    const link_solution = {
                        article_url : link_new
                    }
                    // links_solutions.push(link_solution);
                    links_solutions.push(link_new);
                });
                
                resolve(links_solutions);
            } catch(e) {
                reject(e);
            }
        });
    });
}            
function parse2(link_new){
    return new Promise(function(resolve, reject){
        request(link_new, function (error, response, body) {
            // in addition to parsing the value, deal with possible errors
            if (error) return reject(error);
            try {
                const $ = cheerio.load(body);
                const title = $('.row').find('h1').text();
                // console.log(title);
                const author = $('span[itemprop="author"]').text().trim();
                // console.log(author);
                const publishedDate = $('span[itemprop="datePublished"]').text().trim();
                // console.log(publishedDate);
    
                const relatedArticles = [];
                $('.side-list-panel').first().find('a').each((i,element)=> {
                    const link_relatedPage = $(element).attr('href');
                    const title1 = $(element).find('h5').text();
                    const link_relatedPage_new = `${url}${link_relatedPage}`;
                    const relatedArticle = {
                        url : link_relatedPage_new,
                        title : title1
                    };
                    relatedArticles.push(relatedArticle);
                    // console.log(relatedArticles);
    
                });
                // console.log(relatedArticles);
                const article_1 = {
                    url : link_new,
                    title : title,
                    author : author,
                    postingDate : publishedDate,
                    relatedArticles : relatedArticles
                };
                resolve(article_1);
            } catch(e) {
                reject(e);
            }
        });
    });
}

parse().then(function(link) {
    Promise.map(link,function(link2){
        // console.log(link2);
        return parse2(link2);
    })
    .then(function(value){
        // console.log(value);
        const solutions = {
            articles : value
        }
        console.log(solutions);
        fs.writeFileAsync('solution.json', JSON.stringify(solutions)).then(function() {
            console.log("succesfully written");
        });
    });
}).catch(function(error) {
    console.err(error);
});
