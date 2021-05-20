require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const superagent = require('superagent');
const ejs = require('ejs');
const pg = require('pg');
const methodOverride = require('method-override');
const PORT=process.env.PORT||3000;
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('./public'));
app.set('view engine', 'ejs');
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
// const client = new pg.Client(process.env.DATABASE_URL);

app.get('/',homePage);
app.get('/productByPrice',productByPrice);
app.get('/maybellineProducts',maybellineProducts);
app.get('/myCard',myCard);
app.post('/myProduct',myProduct);
app.get('/productDetails/:id',productDetails);
app.delete('/delete/:id',deleteProduct);
app.put('/update/:id',updateProduct);

function deleteProduct(req,res)
{
    

    let sql='DELETE FROM makeup WHERE id=$1;';
    let safeValues=[req.params.id];
    client.query(sql,safeValues).then(result=>
        {
            res.redirect('/myCard');
        });
}
function updateProduct(req,res)
{
    const {name,image_link,price,description}=req.body;

    let sql='UPDATE makeup SET name=$1, image_link=$2, price=$3, description=$4 WHERE id = $5 RETURNING *;';
    let safeValues=[name,image_link,price,description,req.params.id];
    client.query(sql,safeValues).then(result=>
        {
            res.redirect(`/productDetails/${req.params.id}`);
        });
}

function homePage(req,res)
{
    res.render('homePage');
}
function productByPrice(req,res)
{
  const Pname=req.query.Pname;
  const Pmax=req.query.Pmax;
  const Pmin=req.query.Pmin;

  superagent.get(`http://makeup-api.herokuapp.com/api/v1/products.json?brand=${Pname}&price_greater_than=${Pmax}&price_less_than=${Pmin}`)
  .then(data=>
    {
        const result=data.body;
     
        res.render('productByPrice',{data:result});
    }).catch(e=>{console.log("error")})
}
function maybellineProducts(req,res)
{


  superagent.get(`http://makeup-api.herokuapp.com/api/v1/products.json?brand=maybelline`)
  .then(data=>
    {
        const result=data.body;
        console.log(result)
        res.render('MaybellineProducts',{data:result.map(ele=>
            {
                return new MaybellineProducts(ele)
            })});
    }).catch(e=>{console.log("error")})
}

function MaybellineProducts(data)
{
    this.image_link=data.image_link;
    this.name=data.name;
    this.price=data.price;
    this.description=data.description;
}

function myProduct(req,res)
{


    const {name,image_link,price,description}=req.body;
    let sql='INSERT INTO makeup (name, image_link, price, description) VALUES ($1,$2,$3,$4);';
    let safeValues=[name,image_link,price,description];
    client.query(sql,safeValues).then(result=>
        {
            res.redirect('/myCard');
        });
}
function myCard(req,res)
{
    let sql='SELECT * FROM makeup ';
    
    client.query(sql).then(result=>
        {
            console.log(result.rows)
            res.render('myCard',{data:result.rows});
        });
}
function productDetails(req,res)
{
    let sql='SELECT * FROM makeup WHERE id=$1';
    let safeValues=[req.params.id]
    client.query(sql,safeValues).then(result=>
        {
            res.render('ProductDetails',{data:result.rows});
        });
}
client.connect().then(()=>
{
    app.listen(PORT,()=>{console.log('conect to 3000')});
})