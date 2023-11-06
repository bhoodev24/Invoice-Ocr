// import { Router } from 'express';
// const router = Router();
// import { url } from 'gravatar';
// import { genSalt, hash as _hash, compare } from 'bcryptjs';
// import { sign } from 'jsonwebtoken';
// import { secretOrkey } from '../../config/keys';
// import passport from 'passport';

const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");
//Load Input Validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

//Load User model
const User = require("../../models/User");
const InvoiceData = require("../../models/InvoiceData");
const ClientProfile = require("../../models/clientProfile");
const clientProfile = require("../../models/clientProfile");
const Download = require("../../models/Download")


//@route GET api/users/test
//@desc Test users route
//@access Public
router.get("/test", (req, res) => res.json({ msg: "Users Works" }));
router.post("/register1", (req, res) => {
  console.log('begin', req.body)

  const newUser = new User(req.body);
  newUser
  .save()
  .then((user) => res.json(user))
  .catch((err) => {
    console.log(err)
  });
})

//@route POST api/users/register
//@desc Test Register route
//@access Public
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  // //Check Validation
  // if (!isValid) {
  //   return res.status(400).json(errors);
  // }


  User.findOne({ email: req.body.email }).then((user) => {
    if (user) {
      errors.email = "Email already exists";

      return res.status(400).json(errors);
    } else {
      console.log("agency", req.body.agency_id)
      ClientProfile.findOneAndUpdate(
        { _id: req.body.agency_id },
        { $inc: { userNum: 1 } },
        { new: true }
      ).then((data) => {
        console.log("updateuser", data)

        const avatar = gravatar.url(req.body.email, {
          s: "200", //Size
          r: "pg", //Rating
          d: "mm", //Default
        });
  
        const newUser = new User({
          fname: req.body.fname,
          lname: req.body.lname,
          email: req.body.email,
          avatar,
          cif: "B32479328423",
          iva: "s32490234",
          irpf: "R$33,919.81",
          tel: "(097) 234-5678",
          anual: "0",
          mensual: "0",
          consumption: req.body.consumption,
          fee: req.body.fee,
          agency_id: req.body.agency_id,
          password: req.body.password,
        });
  
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then((user) => res.json(user))
              .catch((err) => console.log(err));
          });
        });

      })

    }
  });
});
router.post("/saveInvoice",  (req, res) => {
  console.log("save post", req.body.data);
  let invoiceData = []
  ClientProfile.findOne({_id: req.body.id})
  .then((one) =>{
    req.body.data.map(dt => {
      console.log('log', dt)
      const newData = {
        // format: dt.format,
        ProviderName: dt.ProviderName,
        ProviderCIF: dt.CIF,
        // ClientName: dt.ClientName,
        ClientCIF: one.cif,
        TaxRate: dt.TaxRate,
        InvoiceDate: dt.InvoiceDate,
        InvoiceNumber: dt.InvoiceNumber,
        BaseAmount: dt.BaseAmount,
        TaxAmount: dt.TaxAmount,
        TotalAmount: dt.TotalAmount,
        UserId: dt.userId,
        ClientId: dt.Client_ID,
        FileName: dt.FileName
      };
      saveInvoiceData(newData)

    })

})
.catch((err) => {
  console.log(err)
})
})

async function saveInvoiceData(data) {
  try {
    console.log('newData', data);
    const newData = new InvoiceData(data);
    const users = await newData.save();
  } catch (error) {
    console.error(error);
    
  }
}

router.post("/save", (req, res) => {
  console.log("save post", req.body.Client_ID);

  ClientProfile.findOne({_id: req.body.Client_ID})
  .then((one) =>{
      const newData = new InvoiceData({
        format: req.body.format,
        ProviderName: req.body.ProviderName,
        ProviderCIF: req.body.CIF,
        ClientName: req.body.ClientName,
        ClientCIF: one.cif,
        TaxRate: req.body.TaxRate,
        InvoiceDate: req.body.InvoiceDate,
        InvoiceNumber: req.body.InvoiceNumber,
        BaseAmount: req.body.BaseAmount,
        TaxAmount: req.body.TaxAmount,
        TotalAmount: req.body.TotalAmount,
        UserId: req.body.userId,
        ClientId: req.body.Client_ID
      });
    console.log('newData', newData);


  newData
    .save()
    .then((data) => res.json(data))
    .catch((err) => {
      console.log(err)});
})
.catch((err) => {
  console.log(err)
})
})

router.post("/edit", (req, res) => {
  console.log(req.body.oldemail);
  const profileFields = {};
  profileFields.fname = req.body.fname;
  profileFields.cif = req.body.cif;
  profileFields.iva = req.body.iva;
  profileFields.irpf = req.body.irpf;
  profileFields.anual = req.body.anual;
  profileFields.mensual = req.body.mensual;
  profileFields.tel = req.body.tel;
  profileFields.email = req.body.email;

  User.findOne({ email: req.body.oldemail })
    .then((user) => {
      if (user) {
        User.findOneAndUpdate(
          { email: req.body.oldemail },
          { $set: profileFields },
          { new: true }
        )
          // const newUser = new User({
          //   fname: req.body.fname,
          //   cif: req.body.cif,
          //   iva: req.body.iva,
          //   irpf: req.body.irpf,
          //   anual: req.body.anual,
          //   mensual: req.body.mensual,
          //   email: req.body.email,
          //   tel: req.body.tel,
          // })

          .then((data) => res.json(data))
          .catch((err) => console.log(err));
      } else {
        console.log("User not found");
      }
    })
    .catch((err) => console.log(err));
});

router.post("/editAgency", (req, res) => {
  const agencyInfo = {};
  agencyInfo.name = req.body.name;
  agencyInfo.cif = req.body.cif;
  agencyInfo.id = req.body.id;
  agencyInfo.fee = req.body.fee;
  agencyInfo.consumption = req.body.consumption;
  agencyInfo.bankAccount = req.body.bankAccount;
  agencyInfo.license = req.body.license;
  agencyInfo.contactName = req.body.contactName;
  agencyInfo.phone = req.body.phone;
  agencyInfo.mail = req.body.mail;

  ClientProfile.findOneAndUpdate(
    { _id: req.body.tableID },
    { $set: agencyInfo },
    { new: true }
  )
    .then((data) => res.json(data))
    .catch((err) => console.log(err));


});
router.post('/editclientUser', (req, res) => {
  const userInfo = {};
  userInfo.fname = req.body.fname;
  userInfo.lname = req.body.lname;
  userInfo.cif = req.body.cif;
  userInfo.iva = req.body.iva, 
  userInfo.irpf = req.body.irpf;
  userInfo.license = req.body.license;
  userInfo.email = req.body.email;
  userInfo.consumption = req.body.consumption
  userInfo.fee = req.body.fee
  console.log('data', req.body)
  User.findOneAndUpdate(
    { _id: req.body.tableID },
    { $set: userInfo },
    { new: true }
  )
    .then((data) => res.json(data))
    .catch((err) => console.log(err));
})


router.post("/editUser", (req, res) => {
  const userInfo = {};
  userInfo.fname = req.body.fname;
  userInfo.lname = req.body.lname;
  userInfo.cif = req.body.cif;
  userInfo.agency_id = req.body.agency_id;
  userInfo.irpf = req.body.irpf;
  // userInfo.tax = req.body.tax;
  userInfo.license = req.body.license;
  userInfo.consumption = req.body.consumption;
  userInfo.fee = req.body.fee;
  // userInfo.contactName = req.body.contactName;
  // userInfo.phone = req.body.phone;
  userInfo.email = req.body.email;

  User.findOneAndUpdate(
    { _id: req.body.tableID },
    { $set: userInfo },
    { new: true }
  )
    .then((data) => res.json(data))
    .catch((err) => console.log(err));
});

async function getUsersByAgency(agency, res) {
  try {
    let wholeUserinfo = [];

    const users = await User.find({ agency_id: agency._id });
    // console.log('users', users)
    const Invoices = await InvoiceData.find();

    for(let i = 0; i< users.length; i++){
      let smUser = {
        user: {},
        invoice: []
      }
        smUser.user = users[i]
      for(let j = 0; j< Invoices.length; j++){

        if(users[i]._id.toString() === Invoices[j].UserId.toString()){
          smUser.invoice.push(Invoices[j])
        }
      }
      // console.log('consum', smUser)
      wholeUserinfo.push(smUser)
    // console.log('111', wholeUserinfo)
    }

    // console.log('smuser', wholeUserinfo)

    res.status(200).json({status: 'success', agency: agency, userdata: wholeUserinfo})


  } catch (error) {
    console.error(error);
  }
}
async function getInvoiceByUserID(userID) {
  try {
    const users = await InvoiceData.find({ UserId: userID });
  } catch (error) {
    console.error(error);
    
  }
}
router.get("/getInvoices", (req,res) => {
  InvoiceData.find()
  .then((invoices) => {
    console.log('invoices', invoices)
    return res.status(200).json({status: 'success', data: invoices})
  })
  .catch((err) => console.log(err));

})

router.post("/clientSave", (req, res) => {
  console.log('client', req.body.license)
  ClientProfile.findOne({license: req.body.license})
  .then((client) =>{
    console.log('usersuer', client)
    if (client == null) {
      let errors = "No se encontró su licencia, verifique su licencia o confirme con su administrador";
      return res.status(404).json({errors: errors, status: 'error'});
    }else {


      getUsersByAgency(client,res)
    }

  })

});

router.post("/add_agency", (req, res) => {
  let usernum = 0;
  User.find()
    .then((data) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i]["agency"] == req.body.id) {
          usernum++;
        }
      }
      const newData = new ClientProfile({
        name: req.body.name,
        cif: req.body.cif,
        fee: req.body.fee,
        consumption: req.body.consumption,
        bankAccount: req.body.bankAccount,
        license: req.body.license,
        contactName: req.body.contactName,
        id: req.body.id,
        phone: req.body.phone,
        mail: req.body.mail,
        userNum: usernum,
      });

      newData
        .save()
        .then((data) => res.json(data))
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

router.post("/add_user", (req, res) => {
  ClientProfile.find().then((data) => {
    console.log(data);
    for (let i = 0; i < data.length; i++) {
      if (data[i]["id"] == req.body.agency) {
        data[i]["userNum"]++;

        const userNum = {};
        userNum.userNum = data[i]["userNum"];

        ClientProfile.findOneAndUpdate(
          { id: req.body.agency },
          { $set: userNum},
          { new: true }
        )
          .then((data) => res.json(data))
          .catch((err) => console.log(err));
      }
    }
  });

  const newData = new User({
    fname: req.body.fname,
    lname: req.body.lname,
    cif: req.body.cif,
    tax: req.body.tax,
    irpf: req.body.irpf,
    email: req.body.email,
    license: req.body.license,
    anual: '0',
    mensual: '0',
    consumption: req.body.consumption,
    fee: req.body.fee,
    contactName: req.body.contactName,
    agency_id: req.body.agency,
    phone: req.body.phone,
  });

  newData
    .save()
    .then((data) => res.json(data))
    .catch((err) => console.log(err));
});

router.post("/getAgency", (req, res) => {
  ClientProfile.findById(req.body.id)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => console.log(err));
});

router.post("/getUser", (req, res) => {
  User.findById(req.body.id)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => console.log(err));
});

router.get("/getWholeUser", (req, res) => {
  User.find()
    .then((data) => {
      res.status(200).json({status: 'success', data})

    })
    .catch((err) => {
      res.status(400).json({status: 'false', err})

    });
});

router.post("/gather", (req, res) => {
  console.log(req.body.userId)
  InvoiceData.find().populate('ClientId', ['name', 'id']) // sent whole InoiceData and front end filter by userID
    .exec((err, data) => {
      if(err) {
      } else {
        console.log('dd', data)
        res.status(200).json(data)
      }
    })
});

router.get("/userlist", (req, res) => {
  User.find().populate('agency_id', ['name', 'id'])
    .exec((err,data) => {
      res.json(data);
    })
    // .catch((err) => console.log(err));
});
router.get("/invoicelist", (req, res) => {
  InvoiceData.find()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => console.log(err));
});
router.get('/getclients', (req, res) => {
  ClientProfile.find()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log(err);
    });
})

router.post('/updateUserLicense', (req, res) => {
  console.log('updateUserLicense', req.body)
  User.updateOne({ _id: req.body._id },
     { fname: req.body.name,
       cif: req.body.cif,
       iva: req.body.iva,
       email: req.body.mail,
       license: req.body.license,
    }).then((one) => {
      res.status(200).json({status: 'success', data: one})
    });
});
router.post('/updateUser', (req, res) => {
  console.log('updateUser', req.body)
  let dt = {
    fname: req.body.name,
    cif: req.body.cif,
    iva: req.body.iva,
    email: req.body.mail,
  }
  User.findOneAndUpdate(
    { _id: req.body._id },
    { $set: dt},
    { new: true }).populate('agency_id', ['name', 'id'] ).exec((err, user) => {
      if (err) {
        res.status(400).json({status: 'false', err})

      } else {
        // Access the populated posts field in the updated user document
        res.status(200).json({status: 'success', data: user})

      }
    })
});
router.post('/getdownload', (req, res) => {

  Download.find()
  .then((data) => {
    console.log('date', data);

    res.status(200).json({status: 'success', data});
  })
  .catch((err) => console.log(err));

})
router.get('/setflaginvoice', (req, res) => {
  const date = req.query.param1;
  const userid = req.query.param2;
  const ageny_id = req.query.param4;
  const filesString = req.query.param3
  const cif= req.query.param5
  const name= req.query.param6
  const tax_amount= req.query.param7
  const base_amount= req.query.param8
  const total= req.query.param9
  const files = filesString.split(',');
  console.log('files1231243343', filesString)

  res.status(200).json({status: 'success'})
  let downData = new Download({
    ClientId: ageny_id,
    InvoiceFiles: filesString,
    cif,
    name,
    tax_amount,
    base_amount,
    total,
  })
  downData.save()

  InvoiceData.find()
  .then((data) => {
    console.log('date', data);
    data.forEach((index) => {
      if(new Date(date) < new Date(index.Date) && userid == index.UserId)
      index.downloadFlag = true;
      index.save(); // Save the modified document
    });
    res.json('success');
  })
  .catch((err) => console.log(err));
  
})

router.post('/updateClient', (req, res) => {
  console.log('updateClient', req.body)
  let dt = {
    name: req.body.name,
    cif: req.body.cif,
    contactName: req.body.contactName,
    mail: req.body.mail,
    phone: req.body.phone 
  }
  ClientProfile.findOneAndUpdate(
    { _id: req.body._id },
    { $set: dt},
    { new: true }
    ).then((one) => {
  console.log('updateClient', one)

      res.status(200).json({status: 'success', data: one})
    });
})
router.get("/clientlist", (req, res) => {


  updateClientByUsers(res)
});

async function updateClientByUsers(res) {
  try {
    const clients = await ClientProfile.find();
    const users = await User.find();
    clients.map(async client => {
      let i =0
      users.map(async user => {
        if(client._id.toString() == user.agency_id){
          await ClientProfile.updateOne({ _id: client._id }, { userNum: ++i});
        }
      })
      if(i == 0){
        await ClientProfile.updateOne({ _id: client._id }, { userNum: 0});
      }
    })
    const againClients = await ClientProfile.find();
    console.log('cllients', againClients)
    res.status(200).json({status: 'success', data: againClients})


  } catch (error) {
    console.error(error);
    
  }
}
router.post('/getusers', (req, res) => {
  let agency_id = req.body.agency_id
  let perMonth = new Array(12).fill(0);
  const endDate = new Date();
  currentDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), endDate.getHours(), endDate.getMinutes(), endDate.getSeconds(), endDate.getMilliseconds());
  User.find().then((sel) => {
    for(let i =0; i < sel.length; i++){
      if(sel[i].agency_id.toString() == agency_id){
        console.log('log', sel[i],new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), endDate.getHours(), endDate.getMinutes(), endDate.getSeconds(), endDate.getMilliseconds()))

          for(let j = 0; j < 12; j ++){
            if(new Date(endDate.getFullYear(), endDate.getMonth()- j, 1)<sel[i].date
            && sel[i].date <= new Date(endDate.getFullYear(), endDate.getMonth()- j + 1, 1))
            {

              perMonth[j] ++
            }
          }

      }
    }
      console.log('startDtae', perMonth)

    return res.json(perMonth)
  })

})

router.post('/deleteVoice', (req,res) => {
  let user_id = req.body.id
  // InvoiceData.find().populate('ClientId', ['name', 'id']) // sent whole InoiceData and front end filter by userID
  // .exec((err, data) => {
  //   if(err) {
  //   } else {
  //     console.log('dd', data)
  //     res.status(200).json(data)
  //   }
  // })
  InvoiceData.deleteMany({ UserId: user_id }, (error, result) => {
    if (error) {
      res.status(400).json('failed')

      console.error('Error deleting record:', error);
    } else {
      res.status(200).json('success')

      console.log('Record deleted successfully', result);
    }
  })

})

router.post('/getbills', (req, res) => {
  let agency_id = req.body.agency_id;
  let startDate
  let pipeline, returnValue
  const endDate = new Date();
  console.log('enddate', endDate)
  let perMonth = new Array(12).fill(0);

    currentDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    
    InvoiceData.find().then((sle) => {
      for(let i =0; i < sle.length; i++){
        if(sle[i].ClientId == agency_id){

            for(let j = 0; j < 12; j ++){

              if(new Date(endDate.getFullYear(), endDate.getMonth()- j, 1)<sle[i].Date
               && sle[i].Date < new Date(endDate.getFullYear(), endDate.getMonth()- j + 1, 1))
              {
                perMonth[j] ++
              }
            }

        }
      }
      console.log('permonth', perMonth)
      return res.json(perMonth)
    })
    .catch((err) =>{
      console.log('err', err)
    })



//   switch(period) {
//     case '1':
//       startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, endDate.getDate());
//       break;
//       case '3':
//       startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 3, endDate.getDate());
//       break;
//       case '6':
//       startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 6, endDate.getDate());
//       break;
//       case '12':
//       startDate = new Date(endDate.getFullYear() - 1, endDate.getMonth(), endDate.getDate());
//       break;  
  
//   }
//   console.log('enddate', startDate)

//   const pipeline = [
//     {
//       $match: {
//         ClientName: agency,
//         Date: { $gte: startDate, $lte: endDate }
//       }
//     },
//     {
//       $group: {
//         _id: null,
//         count: { $sum: 1 }
//       }
//     }
//   ];
//  InvoiceData.aggregate(pipeline).exec().then((result) =>{
//     const count = result.length > 0 ? result[0].count : 0;
//     console.log('count', count)
//     return res.json(count)

//   })
//   .catch((error) => {
//     console.error('Error performing aggregation:', error);
//   });


})

router.post("/userInfo", (req, res) => {
  const userId = req.body.userId;
  User.findOne({ userId })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.log(err);
    });
});

//@route GET api/users/login
//@desc Login User / Returning JWT Token
//@access Public
router.post("/login", (req, res) => {
  let license = req.body.license
  console.log('license', license)
  User.findOne({license: license}).populate('agency_id', ['name', 'id'])
  .exec((err,data) =>{
    if (!data) {
      errors = "No se encontró su licencia, verifique su licencia o confirme con su administrador";
      return res.status(404).json(errors);
    }
      return res.status(200).json({status: 'success', data})

   
  })
  //Find user by email
  // User.findOne({ email }).then((user) => {
  //   //Check for user
  //   if (!user) {
  //     errors.email = "User not found";
  //     return res.status(404).json(errors);
  //   }
  //   //Check Password
  //   bcrypt.compare(password, user.password).then((isMatch) => {
  //     if (isMatch) {
  //       // User Matched
  //       const payload = { id: user.id, name: user.fname, avatar: user.avatar, agency: user.agency }; // Create JWT Payload
  //       console.log('payload', payload)
  //       //Sign Token
  //       jwt.sign(
  //         payload,
  //         keys.secretOrKey,
  //         { expiresIn: 3600 },
  //         (err, token) => {
  //           res.json({
  //             success: true,
  //             token: "Bearer " + token,
  //           });
  //         }
  //       );
  //     } else {
  //       errors.password = "Password incorrect";
  //       return res.status(400).json(errors);
  //     }
  //   });
  // });
});

//@route GET api/users/current
//@desc Return current user
//@access Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
    });
  }
);

module.exports = router;
