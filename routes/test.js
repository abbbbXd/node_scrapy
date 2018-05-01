const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const logger = require('log4js').getLogger(__filename);

//https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagegotourl-options puppeteer api

router.post('/', function(req, res) {
   puppeteer.launch({args: ['--disable-dev-shm-usage']}).then(async browser => {
       let page = await browser.newPage();

       await page.goto('http://es6.ruanyifeng.com/#README', {waitUntil: 'domcontentloaded', timeout: 0});
       await timeout(5000);

       let aTags = await page.evaluate(() => {
           let as = [...document.querySelectorAll('ol li a')];
           return as.map((a) => {
               return {
                   href: a.href.trim(),
                   name: a.text
               }
           })
       })

       await page.pdf({path: `./es6-pdf/${aTags[0].name}.pdf`});
       page.close();

       // 这里也可以使用promise all，但cpu可能吃紧，谨慎操作
       for (var i = 1; i < aTags.length; i++) {
           page = await browser.newPage();
           var a = aTags[i];
           await page.goto(a.href);
           await timeout(5000);
           await page.pdf({path: `./es6-pdf/${a.name}.pdf`});
           page.close();
       }

       browser.close();
   }).catch(onError(res));
});

function timeout (delay) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                resolve(1);
            } catch (e) {
                reject(0);
            }
        }, delay);
    });
}

function onError(res) {
    return function(err) {
        logger.error(err);
        if(typeof err === 'string') {
            res.json({ success: false, msg:'err:' + err})
        } else if(typeof err === 'object') {
            res.json(err);
        } else {
            res.json({ success: false, msg:'err:' + err});
        }
    }
}

module.exports = router;