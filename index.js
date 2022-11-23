const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const app = express()
var path = require('path');
var bodyParser = require('body-parser');  
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'inventorymanagement1230@gmail.com',
      pass: '!inventorymanagement@1230'
    }
  });



var status = {
    login_status:false,
    user_name:'',
    isadmin:false,
    ischecker:false,
};

var urlencodedParser = bodyParser.urlencoded({ extended: false })  
const {v4 : uuidv4} = require('uuid')



var mysql = require('mysql');

var products = [];

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root123",
  database: "inventorymanagement",
  insecureAuth : true
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!!")
});

app.use(express.static(path.join(__dirname, 'styles'))); 
app.use('/semantic',express.static(path.join(__dirname, 'Semantic')));


app.use(expressLayouts)
app.set('view engine', 'ejs');


app.get('/',(req,res) =>{


    if(status.login_status == true){
        res.render('Screens/home',{status:status});
    }
    else{
        res.redirect('/login');
    }

});


app.get('/login',(req,res) => {
    res.render('Forms/login',{mesg:"",status:status});
});

app.post('/login',urlencodedParser,(req,res) => {
    var email = req.body.uemail;
    var password = req.body.upass;

    con.query(`SELECT * FROM USER WHERE UEMAIL= '${email}' AND UPASS='${password}'`, function (err, result, fields) {
        if (err) throw err;
        console.log("");
        if(result.length > 0){
            status.login_status = true;
            status.isadmin = result[0].ISADMIN;
            status.ischecker = result[0].ISCHECKER;
            status.user_name = result[0].UNAME;
            res.redirect('/');
        }
        else{
            res.render('Forms/login',{mesg:"email or password is incorrect",status:status});
        }
      });
})


app.get('/register',(req,res) => {
    res.render('Forms/register',{mesg:'',status:status});
});

app.post('/register',urlencodedParser,(req,res) => {
    var uid = uuidv4();
    var name = req.body.uname;
    var email = req.body.uemail;
    var password = req.body.upass; 
    var cno = req.body.ucno;

    con.query(`INSERT INTO USER VALUES('${uid}','${name}','${email}','${password}','${cno}',false,false);`, function (err, result, fields) {
        if (err) throw err;
        status.login_status = true;
        status.user_name = name;
        res.redirect('/');
    });
});


app.get('/logout',(req,res) => {
    status.login_status = false;
    status.isadmin = false;
    status.ischecker = false;
    status.user_name = '';
    res.redirect('/login');
})


app.get('/category',(req,res) => {
    con.query(`SELECT * FROM categories`, function (err, result, fields) {
        if (err) throw err;
        res.render('Screens/category',{status:status,category:result,sear:0});
    });
});

app.get('/category/add',(req,res) => {
    res.render('Add/AddCategory',{status:status});
});

app.post('/category/add',urlencodedParser,(req,res) => {
    var cname = req.body.cname;
    var active = req.body.active;

    con.query(`INSERT INTO CATEGORIES VALUES('${cname}',${active});`, function (err, result, fields) {
        if (err) throw err;
        res.redirect('/category');
    });

});

app.post('/category/edit',urlencodedParser,(req,res) => {
    var stat = req.body.stat;
    var cname = req.body.cname;
    if(stat == '1'){
        con.query(`SELECT * FROM categories where CAT_NAME='${cname}';`, function (err, result, fields) {
            if (err) throw err;
            res.render('Edit/editCategory',{status:status,category:result,sear:0});
        });
    }
    else{
        var cname = req.body.cname;
        var active = req.body.active;
        con.query(`UPDATE CATEGORIES SET ISACTIVE=${active} where CAT_NAME='${cname}';`, function (err, result, fields) {
            if (err) throw err;
            console.log(active);
            res.redirect('/category');
        });
    }
})
app.post('/category/delete',urlencodedParser,(req,res) => {
    var cname = req.body.cname;

    con.query(`DELETE FROM CATEGORIES WHERE CAT_NAME='${cname}';`, function (err, result, fields) {
        if (err) throw err;
        res.redirect('/category');
    });
});

app.post('/category/search',urlencodedParser,function (req, res) {
    var cname = req.body.cname;

    con.query(`SELECT * FROM categories where CAT_NAME='${cname}';`, function (err, result, fields) {
        if (err) throw err;
        if(result.length > 0){
            res.render('Screens/category',{status:status,category:result,sear:1});
        }
        else{
            res.render('Screens/category',{status:status,category:result,sear:-1});
        }
    });
})


app.get('/units',(req,res) => {
    con.query(`SELECT * FROM UNITS`, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
        res.render('Screens/units',{status:status,units:result,sear:0});
    });
    
});

app.get('/units/add',(req,res) => {
    res.render('Add/AddUnits',{status:status});
});

app.post('/units/add',urlencodedParser,(req,res) => {
    var cname = req.body.uname;
    var active = req.body.active;

    con.query(`INSERT INTO UNITS VALUES('${cname}',${active});`, function (err, result, fields) {
        if (err) throw err;
        res.redirect('/units');
    });
});

app.post('/units/edit',urlencodedParser,(req,res) => {
    var stat = req.body.stat;
    var cname = req.body.uname;
    if(stat == '1'){
        con.query(`SELECT * FROM UNITS where UNIT_NAME='${cname}';`, function (err, result, fields) {
            if (err) throw err;
            res.render('Edit/editUnits',{status:status,units:result,sear:0});
        });
    }
    else{
        var cname = req.body.uname;
        var active = req.body.active;
        con.query(`UPDATE UNITS SET ISACTIVE=${active} where UNIT_NAME='${cname}';`, function (err, result, fields) {
            if (err) throw err;
            console.log(active);
            res.redirect('/units');
        });
    }
})
app.post('/units/delete',urlencodedParser,(req,res) => {
    var cname = req.body.uname;

    con.query(`DELETE FROM UNITS WHERE UNIT_NAME='${cname}';`, function (err, result, fields) {
        if (err) throw err;
        res.redirect('/units');
    });
});

app.post('/units/search',urlencodedParser,function (req, res) {
    var cname = req.body.uname;

    con.query(`SELECT * FROM units where UNIT_NAME='${cname}';`, function (err, result, fields) {
        if (err) throw err;
        if(result.length > 0){
            res.render('Screens/units',{status:status,units:result,sear:1});
        }
        else{
            res.render('Screens/units',{status:status,units:result,sear:-1});
        }
    });
})

const sendmail = require('sendmail')();
var lowInventory = [];

app.get('/inventory',(req,res) => {
    lowInventory = [];
    con.query(`SELECT * FROM INVENTORY`, function (err, result1, fields) {
        if (err) throw err;
        for(var i=0;i< result1.length;i++){
            products.push(result1[i]);
            if(result1[i].QTY <= 10){
                lowInventory.push(result1[i]);
                
            }
        }
        res.render('Screens/inventory',{status:status,products:result1,sear:0});
    });

    
});

app.get('/inventory/add',(req,res) => {
    con.query(`SELECT * FROM CATEGORIES`, function (err, result1, fields) {
        if (err) throw err;
        con.query(`SELECT * FROM UNITS`, function (err, result2, fields) {
            if (err) throw err;
            res.render('Add/AddProduct',{status:status,category:result1,units:result2});
        });
    });
    
});

app.post('/goodproduct',urlencodedParser,(req,res) => {
    var pid = uuidv4();
    var vcode = req.body.vcode;
    var pname = req.body.pname;
    var desc = req.body.desc;
    var uname = req.body.unit;
    var cname = req.body.category;
    var qty = req.body.qty;
    var ppi = req.body.ppi;
    var tc = Number(qty) * Number(ppi);
    var expdate = req.body.ed;
    var d = new Date();
    var today = d;

    con.query(`INSERT INTO INVENTORY VALUES('${pid}','${vcode}','${pname}','${desc}','${uname}','${cname}',${qty},${ppi},${tc},false,'${expdate}','${today}')`, function (err, result1, fields) {
        if (err) throw err;
    });
    con.query(`INSERT INTO IINVENTORY VALUES('${vcode}','${pname}',${qty},${tc},'${today}')`, function (err, result1, fields) {
        if (err) throw err;
        res.redirect('/inventory');
    });
})

app.get('/Damaged',(req,res) => {
    con.query(`SELECT * FROM DAMAGED`, function (err, result1, fields) {
        if (err) throw err;
        var dates = [];
        for (var i = 0; i < result1.length; i++){
            dates.push(result1[i].addedOn.slice(4,15));
        }

        let dupChars = dates.filter((c, index) => {
            return dates.indexOf(c) !== index;
        });

        res.render('Screens/Damaged',{damged: result1,date:dupChars,status:status,sum:0});
    });
});


app.post('/damagedproduct',urlencodedParser,(req,res)=>{
    var iid = uuidv4();
    var vcode = req.body.vcode;
    var pname = req.body.pname;
    var dtype = req.body.dtype;
    var qty = req.body.qty;
    var ppi = req.body.ppi;
    var tc = Number(qty)*Number(ppi);
    var expdate = req.body.ed;
    var d = new Date();
    con.query(`INSERT INTO DAMAGED VALUES('${iid}','${vcode}','${pname}','${dtype}',${qty},${ppi},${tc},'${expdate}','${d}')`, function (err, result1, fields) {
        if (err) throw err;
        res.redirect('/Damaged');
    });
})

app.post('/approve',urlencodedParser,(req,res) => {
    var pid =  req.body.pid;

    con.query(`UPDATE INVENTORY SET ISAPPROVED=true WHERE IID='${pid}'`, function (err, result1, fields) {
        if (err) throw err;
        console.log("approved");
        res.redirect('/inventory');

    });
})

app.post('/inventory/delete',urlencodedParser,(req,res) => {
    var pid =  req.body.pid;
    con.query(`DELETE FROM INVENTORY WHERE IID='${pid}'`, function (err, result1, fields) {
        if (err) throw err;
        console.log("deleted!!");
        res.redirect('/inventory');

    });
});

app.post('/inventory/edit',urlencodedParser,(req,res) => {
    var stat = req.body.stat;
    var pid = req.body.pid;
    if(stat == '1'){
        con.query(`SELECT * FROM INVENTORY WHERE IID='${pid}'`, function (err, result, fields) {
            if (err) throw err;
            con.query(`SELECT * FROM CATEGORIES`, function (err, result1, fields) {
                if (err) throw err;
                con.query(`SELECT * FROM UNITS`, function (err, result2, fields) {
                    if (err) throw err;
                    res.render('Edit/editProduct',{status:status,products:result,category:result1,units:result2});
                });
            });
        });
    }
    else{
    var pid = req.body.pid;
    var vcode = req.body.vcode;
    var pname = req.body.pname;
    var desc = req.body.desc;
    var uname = req.body.unit;
    var cname = req.body.category;
    var qty = req.body.qty;
    var ppi = req.body.ppi;
    var tc = Number(qty) * Number(ppi);
    var expdate = req.body.ed;
    var d = new Date();
    var today = d;

    con.query(`UPDATE INVENTORY SET VENDOR_CODE='${vcode}',PNAME='${pname}',PDESCRIPTION='${desc}',PUNIT='${uname}',PCATEGORY='${cname}',QTY=${qty},PPI=${ppi},TC=${tc},ISAPPROVED=false,EXP_DATE='${expdate}',ADDED_ON='${d}' WHERE IID='${pid}'`, function (err, result1, fields) {
        if (err) throw err;
        res.redirect('/inventory');
    });

    }
});

app.post('/inventory/search',urlencodedParser,(req,res)=>{
    var pname = req.body.pname;

    con.query(`SELECT * FROM INVENTORY where PNAME='${pname}';`, function (err, result, fields) {
        if (err) throw err;
        if(result.length > 0){
            res.render('Screens/Inventory',{status:status,products:result,sear:1});
        }
        else{
            res.render('Screens/Inventory',{status:status,products:result,sear:-1});
        }
    });
})

app.get('/send',(req,res)=>{
    for(var i = 0;i<lowInventory.length; i++){
        sendmail({
            from: 'inventorymanagement1230@gmail.com',
            to: 'mejdhnriywjtopmotc@nthrw.com',//admin email
            subject: 'Low inventory ALert!',
            html: `${lowInventory[i].PNAME} is going to be out of stock`,
          }, function(err, reply) {
            console.log(err && err.stack);
            console.dir(reply);
        });
    }
    res.redirect('/alerts');
})

app.get('/orders',(req,res) => {
    con.query(`SELECT * FROM INVENTORY`, function (err, result1, fields) {
        if (err) throw err;
        
        res.render('Screens/orders',{products: result1,status:status,msg:""});
    });
});

app.post('/placeOrder',urlencodedParser,(req,res)=> {
    var id = uuidv4();
    var name = req.body.name;
    var d = new Date();
    
    const keys = Object.keys(req.body);
    // console.log(keys);
    for(var i = 0; i < products.length; i++){
       for(var j = 1; j < keys.length; j++){
            if(keys[j] == products[i].PNAME){
                var k = keys[j];
                var prdt = req.body[k].split('_');
                var pname = prdt[0];
                var qty = parseInt(prdt[1]);
                var ppi = prdt[2];
                var tc = prdt[3];
                con.query(`INSERT INTO ORDER_ VALUES('${id}','${name}','${pname}',${qty},${ppi},${tc},'${d}');`, function (err, result1, fields) {
                    if (err) throw err;
                });
                con.query(`INSERT INTO ORDERS VALUES('${id}','${name}','${pname}',${tc},'${d}',false);`, function (err, result1, fields) {
                    if (err) throw err;
                });
                var Q = products[i].QTY- qty;
                con.query(`UPDATE INVENTORY SET QTY=${Q} WHERE IID='${products[i].IID}'`, function (err, result1, fields) {
                    if (err) throw err;
                });
            }
       }
    }
    res.redirect('/orders')
});

app.get('/manageorders', function (req, res){
    con.query(`SELECT * FROM ORDERS`, function (err, result2, fields) {
        if (err) throw err;
        var c = [];
        for(var i = 0; i < result2.length; i++){
            c.push(result2[i].OID);
        }
        let dupChars = [...new Set(c)];
        con.query(`SELECT * FROM ORDER_`, function (err, result1, fields) {
            if (err) throw err;
            console.log(result2)
            res.render('Screens/ManageOrder',{orders:result1,order:dupChars,status:status});

        });
    });
})


app.get('/incomingInvoice',(req,res) => {
    con.query(`SELECT * FROM IINVENTORY`, function (err, result1, fields) {
        if (err) throw err;
        var dates = [];
        for(var i = 0; i < result1.length; i++){
            dates.push(result1[i].ADDED_ON.slice(4,15));
        }
        let dupChars = [...new Set(dates)];
        res.render('Screens/IncomingInvoice',{products:result1,dates:dupChars,status:status});
    });
});

app.get('/alerts',(req,res)=> {
    res.render('Screens/Alerts',{products:[],msg:"",status:status,typ:0});
})
app.get('/alerts/lowinventory',(req,res) => {
    res.render('Screens/Alerts',{products:lowInventory,msg:"Low inventory Alert",status:status,typ:1});
}); 


app.listen(3000);