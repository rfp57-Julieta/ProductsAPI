const { Client, Pool} = require('pg');

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  database: "products",
  password: "123",
  port: 5432,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});


// const client = new Client({
//   host: "localhost",
//   user: "postgres",
//   database: "products",
//   password: "123",
//   port: 5432,
// });

// pool.connect()
//   .then((res)=> {
//     console.log('Connect to Postgres successfully!');
//   })
//   .catch((err) => {
//     console.log(err);
//   })

const getProducts = function(cb) {
  let queryString = 'SELECT p.product_id AS id, p.name, p.slogan, p.description, p.category, p.default_price FROM product as p LIMIT 2';
  pool.query(queryString, (err, result) => {
    if(err) {
      cb(err, null);
    } else {
      cb(null, result);
    }
  })
}


const getAProduct = function(id, cb) {
  let queryProduct = `SELECT p.product_id AS id, p.name, p.slogan, p.description, p.category, p.default_price,
  json_agg(json_build_object('feature', f.feature, 'value', f.value)) as features
  FROM public."product" as p
  LEFT JOIN public."features" as f ON f.product_id = p.product_id
  WHERE p.product_id = ${id}
  GROUP BY p.product_id`
  pool.query(queryProduct, (err, result) => {
    if (err) {
      cb(err, null);
    } else {
      cb(null, result.rows[0]);
    }
  })

};

const getStyle = async function(pID) {
  let queryStyle = `SELECT
  productId AS product_id,
  json_agg(
    json_build_object(
      'style_id', styles_id,
      'name', name,
      'sale_price',
      (CASE WHEN styles.sale_price = 'null' THEN '0' END),
      'original_price', original_price,
      'default?', CAST(default_style AS boolean),
      'photos',
      COALESCE( (SELECT json_agg(
        json_build_object(
          'url', url,
          'thumbnail_url', thumbnail_url)
      ) FROM photos
      WHERE photos.styleId = styles.styles_id), json_build_array(json_build_object('url',NULL, 'thumbnail_url', NULL ))),
      'skus',
      COALESCE( (SELECT json_object_agg(
       skus_id, json_build_object(
          'quantity', skus.quantity,
          'size', skus.size)
        ) FROM skus
      WHERE skus.styleId = styles.styles_id
      GROUP BY skus.styleId), json_build_object('null',json_build_object('quantity',NULL, 'size', NULL )))
    )) AS results FROM styles
    WHERE styles.productId = ${pID}
    GROUP BY styles.productId`

  let package = await pool.query(queryStyle).catch((err) => {console.log('style err: ', err)});

  if (package.rows.length === 0 ) {
    return ['no results'];
  } else {
    return package.rows;
  }
}



const getCart = function(cartID, cb) {
  //match the productid then send back the corrsponding styles such as skus_id and quantity
  let queryCart =`SELECT skus_id, quantity
  FROM skus
  LEFT JOIN styles ON skus.styleId = styles.styles_id
  LEFT JOIN cart ON cart.product_id = styles.productId
  WHERE cart.cart_id = ${cartID}
  `
  pool.query(queryCart)
    .then((result) => {
      cb(null, result.rows);
    })
    .catch((err) => {
      cb(err, null);
    })
}

const addToCart = async function(sku_id, sessionID) {
  //provided skus_id, need to find the corsponding product_id
  let queryProductID = `SELECT product_id
  FROM product
  LEFT JOIN styles ON product.product_id = styles.productId
  LEFT JOIN skus ON skus.styleId = styles.styles_id
  WHERE skus.skus_id = ${sku_id}`;

  const productId = await pool.query(queryProductID);
  // return productId.rows[0].product_id;

  //insert the corsponding product_id to cart table
  let queryInsert= `INSERT INTO cart(user_session, product_id, active) VALUES('${sessionID}', ${productId.rows[0].product_id}, ${1}) RETURNING *`;
  const addedItem = await pool.query(queryInsert).catch((err) => {console.log('failed to add to cart: ', err)});

  return addedItem.rows;
};

//(SELECT cart_id+1 FROM cart ORDER BY cart_id DESC LIMIT 1


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
  addToCart,
}

//native version, before optimization:

// const getAProduct1 = function(id, cb) {
//   let queryProduct = `SELECT * FROM product WHERE product_id = ${id}`;
//   let queryFeature = `SELECT feature,value FROM features WHERE product_id = ${id}`;
//   pool.query(queryProduct, (err, result1) => {
//     if(err) {
//       cb(err, null);
//     } else {
//       let package = result1.rows[0];
//       // console.log(package);
//       pool.query(queryFeature, (err, result2) => {
//         if (err) {
//           cb(err, null);
//         } else {
//           package['features'] = result2.rows;
//           cb(null, package);
//         }
//       })
//       // cb(null, result);
//     }
//   })
// }


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

// const getStyle2 = async function(product_id) {
//   let package = {'product_id': product_id};

//   let queryStyle = `SELECT styles_id, name, sale_price, original_price,
//   CAST(default_style AS boolean) FROM styles WHERE productid=${product_id}`;
//   let allStyles = await pool.query(queryStyle);

//   for (let style of allStyles.rows) {
//     if(style.sale_price === "null") {
//       style['sale_price'] = null;
//     }

//     let queryPhoto = `SELECT url, thumbnail_url from photos WHERE styleId = ${style.styles_id}`;
//     let photos = await pool.query(queryPhoto);
//     style['photos'] = photos.rows;

//     // let querySku = `SELECT skus_id, size, quantity from skus WHERE styleId = ${style.styles_id}`;
//     let querySku = `SELECT json_object_agg(skus_id, json_build_object('quantity', skus.quantity, 'size', skus.size)) as skus FROM skus WHERE styleId = ${style.styles_id}`
//     let skus = await pool.query(querySku);
//     // let storageSku = {};
//     // skus.rows.forEach(sku => {
//     //   storageSku[`${sku.skus_id}`] = {'quantity': sku.quantity, 'size': sku.size};
//     // })
//     style['skus'] = skus.rows;
//   }

//   package['results'] = allStyles.rows;
//   return package;
// }