
require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT | 3000;
const cors = require('cors');
const ejs = require('ejs');
const methodOverride = require('method-override');
const pg = require('pg');
const superagent = require('superagent');


app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('./public'));
app.set('view engine', 'ejs');
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
// const client = new pg.Client(process.env.DATABASE_URL);




app.get('*', homePage);
app.get('/productByPrice', productByPrice);
app.get('/mybillienProduct', mybillienProduct);
app.post('/addToDatabase', addToDatabase);
app.get('/myCard', myCard);
app.get('/productDetials/:id', productDetials);
app.put('/updateProduct/:id', updateProduct);
app.delete('/deleteProduct/:id', deleteProduct);


function homePage(req, res) {
  res.render('HomePage');
}
function productByPrice(req, res) {

  const param = req.query;

  superagent.get(`http://makeup-api.herokuapp.com/api/v1/products.json?brand=${param.Pname}&price_greater_than=${param.Pmax}&price_less_than=${param.Pmin}`)
    .then(result => {
      const data = result.body;
      console.log(data);
      res.render('productByPrice', { data: data });
    }).catch(e => {
      console.log(e);
      res.send('somthong went wrong');
    });

}
function mybillienProduct(req, res) {
  superagent.get(`http://makeup-api.herokuapp.com/api/v1/products.json?brand=maybelline`)
    .then(result => {
      const data = result.body;

      res.render('mybillienProduct', {
        data: data.map(ele => {
          return new MybillienProduct(ele);
        })
      });
    }).catch(e => {
      console.log(e);
      res.send('somthong went wrong');
    });

}
function addToDatabase(req, res) {

  const { image_link, name, price, description } = req.body;
  const SQL = `INSERT INTO makeup (image_link, name, price, description)
  VALUES ($1, $2, $3, $4);`;
  const safeValues = [image_link, name, price, description];
  client.query(SQL, safeValues).then(result => {
    res.redirect('/myCard');
  });

}
function myCard(req, res) {
  const SQL = `SELECT * FROM makeup;`;
  client.query(SQL).then(result => {
    res.render('myCard', { data: result.rows });
  });
}
function productDetials(req, res) {

  const SQL = `SELECT * FROM makeup WHERE id=$1;`;
  const safeValues=[req.params.id]
  client.query(SQL,safeValues).then(result => {
    res.render('productDetials', { data: result.rows });
  });
}
function deleteProduct(req, res) {

  const SQL = `DELETE FROM makeup WHERE id=$1;`;
  const safeValues=[req.params.id]
  client.query(SQL,safeValues).then(result => {
    res.redirect('/myCard');
  });
}
function updateProduct(req, res) {

  const { image_link, name, price, description } = req.body;
  const SQL = `UPDATE makeup
  SET image_link = $1, name = $2,price=$3  ,description=$4
  WHERE id=$5;`;
  const safeValues=[image_link, name, price, description,req.params.id]
  client.query(SQL,safeValues).then(result => {
    res.redirect(`/productDetials/${req.params.id}`);
  });
}
function MybillienProduct(data) {
  this.name = data.name;
  this.image_link = data.image_link;
  this.price = data.price;
  this.description = data.description;
}
client.connect().then(() => {
  app.listen(PORT, () => { console.log(`connect on ${PORT}`) });
});
