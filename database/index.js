const { Client, Pool} = require('pg');

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  database: "products",
  password: "123",
  port: 5432,
  idleTimeoutMillis: 0,
  connectionTimeoutMillis: 0,
});


// const client = new Client({
//   host: "localhost",
//   user: "postgres",
//   database: "products",
//   password: "123",
//   port: 5432,
// });

pool.connect()
  .then((res)=> {
    console.log('Connect to Postgres successfully!');
  })
  .catch((err) => {
    console.log(err);
  })

const getProducts = function(cb) {
  let queryString = 'SELECT * FROM product LIMIT 2';
  pool.query(queryString, (err, result) => {
    if(err) {
      cb(err, null);
    } else {
      cb(null, result);
    }
  })
}

const getAProduct = function(id, cb) {
  let queryProduct = `SELECT * FROM product WHERE product_id = ${id}`;
  let queryFeature = `SELECT feature,value FROM features WHERE product_id = ${id}`;
  pool.query(queryProduct, (err, result1) => {
    if(err) {
      cb(err, null);
    } else {
      let package = result1.rows[0];
      // console.log(package);
      pool.query(queryFeature, (err, result2) => {
        if (err) {
          cb(err, null);
        } else {
          package['features'] = result2.rows;
          cb(null, package);
        }
      })
      // cb(null, result);
    }
  })
}


const getStyle = async function(product_id) {
  let package = {'product_id': product_id};

  let queryStyle = `SELECT styles_id, name, sale_price, original_price, default_style FROM styles WHERE productid=${product_id}`;
  let allStyles = await pool.query(queryStyle);

  for (let style of allStyles.rows) {
    if(style.sale_price === "null") {
      style['sale_price'] = null;
    }

    if(style.default_style === 0){
      style['default_style'] = false;
    } else {
      style['default_style'] = true;
    }

    let queryPhoto = `SELECT url, thumbnail_url from photos WHERE styleId = ${style.styles_id}`;
    let photos = await pool.query(queryPhoto);
    style['photos'] = photos.rows;

    let querySku = `SELECT skus_id, size, quantity from skus WHERE styleId = ${style.styles_id}`;
    let skus = await pool.query(querySku);
    let storageSku = {};
    skus.rows.forEach(sku => {
      storageSku[`${sku.skus_id}`] = {'quantity': sku.quantity, 'size': sku.size};
    })
    style['skus'] = storageSku;
  }

  package['results'] = allStyles.rows;
  return package;
}

const getCart = function(cb) {
  let queryCart = 'SELECT * FROM cart LIMIT 3';
  pool.query(queryCart)
    .then((result) => {
      cb(null, result.rows);
    })
    .catch((err) => {
      cb(err, null);
    })
}

const getRelated = function(product_id, cb) {
  let queryRelated = `SELECT related_product_id FROM related WHERE current_product_id = ${product_id}`;
  pool.query(queryRelated)
    .then((result) => {
      let package = result.rows.map(related => {
        return related.related_product_id;
      })
      cb(null, package);
    })
    .catch((err) => {
      cb(err, null);
    })
}


module.exports = {
  // client,
  pool,
  getProducts,
  getAProduct,
  getStyle,
  getCart,
  getRelated,
}



// const getStyle1 = function(product_id, cb) {
//   let package = {};
//   let repackArr = [];
//   let queryStyle = `SELECT styles_id, name, sale_price, original_price, default_style FROM styles WHERE productid=${product_id}`;
//   pool.query(queryStyle, async (err, result) => {
//     if(err) {
//       cb(err, null);
//     } else {
//       package['product_id'] = product_id;
//       let stylePromises = result.rows.map(async (style) => {
//         if(style.sale_price === "null") {
//           style['sale_price'] = null;
//         }

//         if(style.default_style === 0){
//           style['default_style'] = false;
//         } else {
//           style['default_style'] = true;
//         }

//         let queryPhoto = `SELECT url, thumbnail_url from photos WHERE styleId = ${style.styles_id}`;
//         return pool.query(queryPhoto)
//           .then(res => {
//             style['photos'] = res.rows;
//             let querySku = `SELECT skus_id, size, quantity from skus WHERE styleId = ${style.styles_id}`
//             return pool.query(querySku)
//             // console.log(1);
//           })
//           .then((res) => {
//             let storageSku = {};
//             res.rows.forEach(sku => {
//               storageSku[`${sku.skus_id}`] = {'quantity': sku.quantity, 'size': sku.size};
//             })
//             style['skus'] = storageSku;
//             return style;
//           })
//           .catch(err => {
//             console.log(err);
//           })
//       })


//       await Promise.all(stylePromises)
//        .then(result => {
//         package['results'] = result;
//         cb(null, package);
//        })
//        .catch(err => {
//         cb(err, null);
//        })
//       // console.log(2);
//     }
//   })
// }