const puppeteer = require('puppeteer');
var xls = require("exceljs");
let url='https://www.jd.com/';
//封装一个异步滚动函数
async function scroll(page){
    const scrollDistance = 200;
    const direction = 1;
    await page.evaluate(({scrollDistance,direction})=>{
        document.documentElement.scrollBy(
            0, //x轴
            scrollDistance &(direction >0 ? 1:-1)
        );
    },{
        scrollDistance,
        direction,   //传给pagefuction的参数
    }
    )
}





(async () => {
    const browser = await puppeteer.launch({headless:false});
    const page = await browser.newPage();
    await page.setViewport({
        width:1920,
        height:1080,
    })
    await page.goto(url);
    // const hrefArr = await page.evaluate(() => {
    //     let arr = [];
    //     const aNodes = document.querySelectorAll('.cate_menu_lk');
    //     aNodes.forEach(function (item) {
    //         arr.push(item.href)
    //     })
    //     return arr
    // });
    // let arr = [];
    // for (let i = 0; i < hrefArr.length; i++) {
    //     const url = hrefArr[i];
    //     console.log(url) //这里可以打印 
    //     await page.goto(url);
    //     const result = await page.evaluate(() => { //这个方法内部console.log无效 
            
    //           return  $('title').text();  //返回每个界面的title文字内容
    //     });
    //     arr.push(result)  //每次循环给数组中添加对应的值
    // }
    // console.log(arr)  //得到对应的数据  可以通过Node.js的 fs 模块保存到本地
    let search='Search?keyword='
    let keyword='天选3'
    await page.goto('https://search.jd.com/'+search+keyword)
    
    for(let i=0;i<100;i++){
        await scroll(page)
    }
    const result = await page.evaluate(()=>{
    //     for(i=0;i<=30;i++)
    //     {
    //     let price=[]
    //     let str='#J_goodsList > ul > li:nth-child('+i+') > div > div.p-price > strong > i';
    //     let a =document.getElementsByTagName(str).innerHTML;
    //     price.push(a)
    // }
        // console.log(price)
        // page.awaitFor(10000);
        // document.documentElement.scrollBy(0,1000);
        let arry=[];
        let shopid=document.getElementsByClassName('curr-shop hd-shopname');
        let priceall=document.getElementsByClassName('p-price');
        console.log(priceall[0])
        let length=shopid.length;
        for(let i=0;i<length;i++)
        {
            let number=i+1;
            let shopname=shopid[i].innerHTML;
            let price=priceall[i].innerText;
            let data ={
                num:number,
                shopname:shopname,
                price:price
                };
            arry.push(data)
        }
        return arry
    })
    // page.screenshot('')
    console.log(result)

//写入excel
function operation() {
    // 新建一个工作表
    var workbook = new xls.Workbook();
    // 创建日期
    workbook.created = new Date();
    // 修改日期
    workbook.modified = new Date();
    // 作者名称
    workbook.creator = 'pwl';
    // 最后修改人
    workbook.lastModifiedBy = 'pwl';

    // 添加sheet，并且初始化该sheet的名称
    let sheet = workbook.addWorksheet('商品价格');

    // 设置表头
    sheet.columns = [
        {header: '序号', key: 'num', width: 15},
        {header: '店铺名称', key: 'shopname', width: 15},
        {header: '商品价格', key: 'price', width: 15}
    ];

    // 添加多行，data1要是个数组类型(能用foreach遍历)
    sheet.addRows(result);

    // 单行添加，入参可以是一个对象，也可以是一个数组
    // sheet.addRow(data1[0]);

    // 写文件
    workbook.xlsx.writeFile('./shop.xlsx')
    .then(function() {
        // done
        console.log('write done')
    });

};

operation();

    await browser.close()
})()