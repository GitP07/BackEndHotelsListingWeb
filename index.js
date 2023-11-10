const dotEnv = require('dotenv');
dotEnv.config();

const express = require('express');
const app = express();
const cors = require('cors');
const cookieParseer = require('cookie-parser');

const mongoose = require('mongoose');
const db_url = process.env.MONGO_URL;
const bodyPaser = require('body-parser');
const multer = require('multer');

const {verifyToken, loginUserData} = require('./src/auth');
const {singUp, singIn} = require('./controller/authController');
const { hotelRoomList, hotelsRoomsInArea, hotelRoomDetailById, hotelRoomByName, hotelSearchOptionNames, hotelRoomListByRating, hotelRoomRatingList, priceDescendingHotelList, priceAscendingHotelList } = require('./controller/hotelController');


const hotelSchema = require('./schema/hotelSchema');
const bookingSchema = require('./schema/bookingSchema');
const customerReviewSchema = require('./schema/customerReviewSchema');
const hotelFacilitiesSchema = require('./schema/hotelFacilitiesSchema');
const hotelLocationSchema = require('./schema/hotelLocationSchema');
const hotelOfferSchema = require('./schema/hotelOfferSchema');
const hotelPhotosSchema = require('./schema/hotelPhotosSchema');
const checkInOutSchema = require('./schema/checkInOutSchema');
const customerDetailSchema = require('./schema/customerDetailsSchema');
const exprienceSchema = require('./schema/exprienceSchema');
const hostDetailSchema = require('./schema/hostDetailSchema');
const hotelRoomSchema = require('./schema/hotelRoomSchema');

const storage = multer.diskStorage({destination: (req, file, callBack) => {
   callBack(null, "uploads/")
},
filename: (req, file, callBack) => {
   callBack(null, `${Date.now()}-${file.originalname}`)
}
});

const upload = multer({storage});

const connectionParams = {
   useNewUrlParser: true,
   useUnifiedTopology: true,
};

mongoose
   .connect(db_url, connectionParams)
   .then(() => {
      console.log("connection sucessful");
   })
   .catch((err) => {
      console.log("connection failed" + err);
   })

app.use(bodyPaser.json());
app.use(cors({credentials: true, origin: ["https://hotels-c9fv.onrender.com"], methods: ["GET", "POST", "PUT", "DELETE"]}));
app.use(cookieParseer());


//User Sing Up Api

app.post("/singUp", singUp);

//User Login Api
app.post("/singIn", singIn);

//api to upload images
app.post("/uploadImage", upload.any("file", 5),(req, res) => {
   if(!req.file){
      console.log(`file ${req.file}`);
      return res.status(400).json({error:`no file found`});
   }
   res.json({message: `file uploaded sucessfully`, fileName: req.file.filename, filePath: req.file.path})
})



//HOTEL API's
//Api to Display All Hotel Detail
app.get("/", verifyToken, hotelRoomList)

//Api to display  Hotel Info by hotel Id
app.post("/displayHotelRoomDetailBy/:id", hotelRoomDetailById)

//Api to Display Specific Area Hotel Detail
app.post("/hotelsRoomsInArea", verifyToken, hotelsRoomsInArea)

app.post("/hotelSearchOptionNames", hotelSearchOptionNames);

app.post("/searchHotelRoomByName/:hotelName", hotelRoomByName);

app.get("/loginUserData", loginUserData);

app.post("/availableHotel", async function (req, res) {
   const hotelAvailable = await hotelSchema.find({ is_available: true });
   console.log(JSON.stringify(hotelAvailable));
   (hotelAvailable != null && hotelAvailable.length > 0) ? res.json(hotelAvailable) : res.json({ message: `Hotel Rooms Are Not Available` })

})

app.get("/hotelRatingList", hotelRoomRatingList);

app.post("/hotelRoomListByRating", hotelRoomListByRating);

app.get("/highToLowPriceHotelList", priceDescendingHotelList);

app.get("/lowToHighPriceHotelList", priceAscendingHotelList);

//Api to get Location of hotel
app.post("/locationList", async function (req, res) {
   const hotelLocationList = await hotelSchema.find({}, 'hotel_address');
   let locationLisArr = [];

   hotelLocationList.map((location) => {
      locationLisArr.push(location.hotel_address);
   })

   let uniqlocatArr = [...new Set(locationLisArr)];

   res.json(uniqlocatArr);

})

//Api to get all amenities of 
app.post("/hotelsAmenities", async (req, res) => {
   const hotelsAmenities = await hotelSchema.find({}, 'hotel_amenities');
   let AmenitiesArr = [];
   let tempAllAmenitiesArr = [];

   hotelsAmenities.map((elementArr) => {
      AmenitiesArr.push(elementArr.hotel_amenities)
   })

   for (let i = 0; i < AmenitiesArr.length; i++) {
      let tempArr = AmenitiesArr[i]
      for (let j = 0; j < tempArr.length; j++) {
         tempAllAmenitiesArr.push(tempArr[j]);

      }

   }

   const uniqAmenities = [...new Set(tempAllAmenitiesArr)];

   res.json(uniqAmenities);
})
//Api to Dispaly HotelList By Amenities
app.post("/hotelRoomsByAmenities", async (req, res) => {

   const selectAmenities = req.body.hotel_amenities
   const hotelList = await hotelSchema.find({ hotel_amenities: selectAmenities })
   console.log(JSON.stringify(selectAmenities));
   res.json(hotelList);
})

//Api to Edit Hotel List Info By id
app.post("/editHotelInfo", async (req, res) => {
   const hotelId = req.body._id;
   const hotelUpdateList = req.body;
   const hotelListInfo = await hotelSchema.find();
   let checkId = false;
   console.log(checkId);

   hotelListInfo.map((list) => {
      if (list._id == hotelId) {
         return checkId = true;;
      }
   })
   console.log(checkId);


   console.log(hotelId);
   console.log(`update ingo ${JSON.stringify(hotelUpdateList)}`);

   if (checkId) {
      const hotelUpdatedInfo = await hotelSchema.findOneAndUpdate({ _id: hotelId }, {
         $set: {
            hotel_name: hotelUpdateList.hotel_name,
            hotel_rating: hotelUpdateList.hotel_rating,
            hotel_address: hotelUpdateList.hotel_address,
            hotel_descr: hotelUpdateList.hotel_descr,
            hotel_room: hotelUpdateList.hotel_room,
            hotel_contact: hotelUpdateList.hotel_contact,
            hotel_checkin: hotelUpdateList.hotel_checkin,
            hotel_checkout: hotelUpdateList.hotel_checkout,
            room_price: hotelUpdateList.room_price,
            offer_price: hotelUpdateList.offer_price,
            review_count: hotelUpdateList.review_count,
            photo_count: hotelUpdateList.photo_count,
            nearby_count: hotelUpdateList.nearby_count,
            hotel_amenities: hotelUpdateList.hotel_amenities,
            hotel_facilities: hotelUpdateList.hotel_facilities,
            is_available: hotelUpdateList.is_available
         }
      }, { new: true });

      res.json(hotelUpdatedInfo);
   }
   else {
      res.json({ message: "Hotel Id Not Found" });
   }
})

//Api To add New Hotel Room Info
app.post("/addNewHotelRoomInfo", async (req, res) => {
   const newHotelInfo = req.body;
   const hotelName = req.body.hotel_name;
   const hotelRoomData = await hotelSchema.find();
   const roomKeysArr = Object.keys(newHotelInfo);
   const dataKeysArr = Object.keys(hotelRoomData[0].toObject());//16-1
   let tempArr = [];
   let checkName = true;

   for (let i = 0; i < dataKeysArr.length; i++) {
      let value = roomKeysArr[i];
      if (dataKeysArr.indexOf(value) >= 0) {
         tempArr.push(roomKeysArr[i]);
      }
   }

   console.log(roomKeysArr.length);
   if (roomKeysArr.length !== 0) {

      if (tempArr.length === dataKeysArr.length -1 && roomKeysArr.length === tempArr.length) {

         for (let i = 0; i < hotelRoomData.length; i++) {
            if (hotelRoomData[i].hotel_name === hotelName) {
               checkName = false;
               break;
            }
         }

         if (checkName) {

            if (typeof newHotelInfo.hotel_name === "string" && typeof newHotelInfo.hotel_address === "string" && typeof newHotelInfo.hotel_descr === "string" &&
               typeof newHotelInfo.hotel_checkin === "string" && typeof newHotelInfo.hotel_checkout === "string") {

               if (typeof newHotelInfo.hotel_rating === "number" && typeof newHotelInfo.room_price === "number" && typeof newHotelInfo.review_count === "number"
                  && typeof newHotelInfo.offer_price === "number" && typeof newHotelInfo.nearby_count === "number" && typeof newHotelInfo.photo_count === "number" && typeof newHotelInfo.hotel_contact === "number") {

                  if (Array.isArray(newHotelInfo.hotel_facilities)) {

                     if (Array.isArray(newHotelInfo.hotel_amenities)) {

                        if (newHotelInfo.hotel_rating <= 5 && newHotelInfo.hotel_rating >= 0) {

                           if (newHotelInfo.offer_price >= 0 && newHotelInfo.room_price >= 0) {

                              if (newHotelInfo.hotel_contact.toString().length === 10) {

                                 if (typeof newHotelInfo.is_available === "boolean") {

                                    const newHotelDetail = await hotelSchema(newHotelInfo);
                                    await newHotelDetail.save();
                                    const updatedHotelRoomList = await hotelSchema.find();

                                    res.json({ message: `New Hotel Room Info Updated Sucessfully`, updatedHotelList: updatedHotelRoomList });

                                 }
                                 else {
                                    res.json({ message: `is_available Value Must Be an Boolean Value` });
                                 }
                              }
                              else {
                                 res.json({ mesage: `Invalid Hotel Contact Number` })
                              }
                           }
                           else {
                              res.json({ mesage: `offer_price OR room_price Cannot Be In nagative` });
                           }
                        }
                        else {
                           res.json({ message: `hotel_rating Value Cannot More Then 5 or In Nagative Value` });
                        }

                     }
                     else {
                        res.json({ message: `Hotel_amenities must Contain All Hotel facilities Information In An Array` });
                     }
                  }
                  else {
                     res.json({ message: `Hotel_facilities must Contain All Hotel facilities Information In An Array` });
                  }
               }
               else {
                  res.json({ message: `hotel_rating,room_price,offer_price,review_count,nearby_count,photo_count,hotel_contacts Values Must Be In Numbers` });
               }
            }
            else {
               res.json({ message: `hotel_name,hotel_address,hotel_descr,hotel_checkin,hotel_checkout Values MusT Be In String` });
            }
         }
         else {
            res.json({ message: `Hotel Room Information with Hotel Name ${hotelName} Is Already There` });
         }
      }
      else {
         res.json({ message: `Please Enter All Valid Keys` });
      }
   }
   else {
      res.json({ message: `No Request` });
   }
})


//Api To Delete Hotel Room List Info By Id
app.post("/deleteHotelRoomInfo", async (req, res) => {
   const hotelId = req.body._id;
   // const userData = req.body;
   const userKeyArr = Object.keys(req.body);
   const hotelListInfo = await hotelSchema.find();
   let checkId = false;
   console.log(userKeyArr.length);

   if (userKeyArr.length !== 0) {
      if (userKeyArr.length === 1) {
         if (userKeyArr[0] === "_id") {

            hotelListInfo.map((list) => {
               if (list._id == hotelId) {
                  return checkId = true;;
               }
            })
            console.log(checkId);

            if (checkId) {
               await hotelSchema.findOneAndDelete({ _id: hotelId });
               const listAfterDeleteHotel = await hotelSchema.find();
               res.json({ mesage: `Hotel Room Inf By Id:${hotelId} Deleted Sucessfully`, HotelRoomList: listAfterDeleteHotel });
            }
            else {
               res.json({ message: "Hotel Id Not Found" });
            }

         }
         else {
            res.json({ mesage: `Plese Enter Correct Key Name Of ID` })
         }
      }
      else {
         res.json({ mesage: `Body Must Contain only Hotel Room List ID ` })
      }
   }
   else {
      res.json({ mesage: `Cannot Delete Data Without Request` })
   }


})


//CHECK IN CHECK OUT TABLE API's

//api to display Customer check In-Out info
app.get("/customerCheckInCheckOut", async (req, res) => {
   const checkInOutInfo = await checkInOutSchema.find();
   res.json(checkInOutInfo);

})

//api to add new check in check out info
app.post("/addCheckInCheckOutDetail", async (req, res) => {
   const newDetail = req.body;
   const detailKeysArr = Object.keys(newDetail);
   const validData = await checkInOutSchema.find();
   const validKeysArr = Object.keys(validData[0].toObject());
   let tempArr = [];
   detailKeysArr.map((value) => {
      if (validKeysArr.indexOf(value) > 0) {
         tempArr.push(value);
      }
   })

   console.log(`data Length ${validKeysArr.length} input Length ${tempArr.length}`);

   if (detailKeysArr.length !== 0) {

      if (validKeysArr.length -1 === tempArr.length && detailKeysArr.length === tempArr.length) {
         const newCheckInOutInfo = await checkInOutSchema(newDetail);
         await newCheckInOutInfo.save();
         const updatedList = await checkInOutSchema.find();
         res.json({ mesage: `Updated Check In Check Out Lists`, list: updatedList });
      }
      else {
         res.json({ message: `messing Some Keys OR added invalid keys please enter all valid keys to add new Check In Check Out Info` })
      }

   }
   else {
      res.json({ message: `No Request` })
   }

})

//api to edit check in check ou info
app.post("/editCheckInCheckOutInfo", async (req, res) => {
   const editInfo = req.body;
   const editInfoId = req.body._id;
   const inputKeysArr = Object.keys(req.body);
   const findId = await checkInOutSchema.find();
   let idChecked = false;

   console.log(editInfoId);

   console.log(idChecked);

   if (inputKeysArr.length !== 0) {

      findId.map((infoId) => {
         if (infoId._id == editInfoId) {
            return idChecked = true;
         }
      })

      if (idChecked) {
         const updateCheckInCheckOutInfo = await checkInOutSchema.findOneAndUpdate({ _id: editInfoId }, {
            $set: {
               checkIn_date: editInfo.checkIn_date,
               checkOut_date: editInfo.checkOut_date,
               location: editInfo.location,
               numberOf_guest: editInfo.numberOf_guest
            }
         }, { new: true });

         res.json({ message: `Edited List Of Id: ${editInfoId}`, list: updateCheckInCheckOutInfo });

      }
      else {
         res.json({ message: `Id Not Found` })
      }
   }
   else {
      res.json({ message: `No Request` })
   }

})

//api to delete checkIn checkOut info
app.post("/deleteCheckInCheckOutInfo", async (req, res) => {
   const deleteId = req.body._id;
   const inputKeysArr = Object.keys(req.body);
   const findId = await checkInOutSchema.find();
   let idChecked = false;

   if (inputKeysArr.length !== 0) {

      if (inputKeysArr.length === 1) {

         if (inputKeysArr[0] === "_id") {

            findId.map((infoId) => {
               if (infoId._id == deleteId) {
                  return idChecked = true;
               }
            })
            if (idChecked) {
               await checkInOutSchema.findOneAndDelete({ _id: deleteId });
               const deletedList = await checkInOutSchema.find();
               res.json({ message: `List After deletion`, list: deletedList });
            }
            else {
               res.json({ message: `Id Not Found` })
            }

         }
         else {
            res.json({ message: `Please Enter Correct Id Key Name That is _id` })
         }
      }
      else {
         res.json({ mesage: `body Must Contain Only CheckIn-Out Info Id` })
      }
   }
   else {
      res.json({ message: `No Request` });
   }
})


//CUSTOMER DETAIL API's

//api to display customer detail
app.get("/displayCustomerDetail", async (req, res) => {
   const customerDetail = await customerDetailSchema.find();
   res.json(customerDetail);
})

//api to edit customer Detail
app.post("/editCustomerDetail", async (req, res) => {
   const editInfo = req.body;
   const editInfoId = req.body.customer_id;
   console.log(editInfoId);
   const inputKeysArr = Object.keys(req.body);
   const foundId = await customerDetailSchema.find();
   let idChecked = false;

   console.log(editInfoId);
   console.log(idChecked);

   if (inputKeysArr.length !== 0) {

      foundId.map((list) => {
         if (list.customer_id == editInfoId) {
            return idChecked = true;
         }
      })

      if (idChecked) {
         const updatedCustomerDetail = await customerDetailSchema.findOneAndUpdate({ customer_id: editInfoId }, {
            $set: {
               first_name: editInfo.first_name,
               last_name: editInfo.last_name,
               customer_ph: editInfo.customer_ph,
               customer_email: editInfo.customer_email,
               customer_pass: editInfo.customer_pass
            }
         }, { new: true });

         res.json({ message: `Edited List Of Id: ${editInfoId}`, list: updatedCustomerDetail });

      }
      else {
         res.json({ message: `Id Not Found` });
      }
   }
   else {
      res.json({ message: `No Request` });
   }
})

//api to add New Customer data
app.post("/addNewCustomerDetail", async (req, res) => {
   const newDetail = req.body;
   const newCustomerId = req.body.customer_id;
   const detailKeysArr = Object.keys(newDetail);
   const foundId = await customerDetailSchema.find();
   let checkId = true;
   const validData = await customerDetailSchema.find();
   const validKeysArr = Object.keys(validData[0].toObject());
   let tempArr = [];

   detailKeysArr.map((value) => {
      if (validKeysArr.indexOf(value) > 0) {
         tempArr.push(value);
      }
   })

   console.log(newDetail);
   if (detailKeysArr.length !== 0) {

      if (validKeysArr.length -1 === tempArr.length && detailKeysArr.length === tempArr.length) {

         foundId.map((customer) => {
            if (customer.customer_id === newCustomerId) {
               return checkId = false;
            }
         })

         if (checkId) {
            const newCustomerDetail = await customerDetailSchema(newDetail);
            await newCustomerDetail.save();
            const updatedList = await customerDetailSchema.find();
            res.json({ mesage: `Updated Customer Detail List`, list: updatedList });
         }
         else {
            res.json({ message: `customer id Already Exist` })
         }
      }
      else {
         res.json({ message: `messing Some Keys OR added invalid keys please enter all valid keys to add new Customer Detail` })
      }
   }
   else {
      res.json({ message: `No Request` })
   }
})

//api to delete customer detail
app.post("/deleteCustomerDetail", async (req, res) => {
   const deleteId = req.body.customer_id;
   const inputKeysArr = Object.keys(req.body);
   const findId = await customerDetailSchema.find();
   let idChecked = false;

   if (inputKeysArr.length !== 0) {

      if (inputKeysArr.length === 1) {

         if (inputKeysArr[0] === "customer_id") {

            findId.map((infoId) => {
               if (infoId.customer_id == deleteId) {
                  return idChecked = true;
               }
            })
            if (idChecked) {
               await customerDetailSchema.findOneAndDelete({ customer_id: deleteId });
               const deletedList = await customerDetailSchema.find();
               res.json({ message: `List After deletion`, list: deletedList });
            }
            else {
               res.json({ message: `Id Not Found` })
            }

         }
         else {
            res.json({ message: `Please Enter Correct Id Key Name That is customer_id` })
         }
      }
      else {
         res.json({ mesage: `body Must Contain Only Customer Id` })
      }
   }
   else {
      res.json({ message: `No Request` });
   }
})


//CUSTOMER REVIEW API's

//api to display all customers review
app.get("/dispalyCustomerReview", async (req, res) => {
   const displayList = await customerReviewSchema.find();
   res.json(displayList);
})

// api to add new review
app.post("/addNewReview", async (req, res) => {
   const newReview = req.body
   const detailKeysArr = Object.keys(req.body);
   const validData = await customerReviewSchema.find();
   const validKeysArr = Object.keys(validData[0].toObject());
   let tempArr = [];
   detailKeysArr.map((value) => {
      if (validKeysArr.indexOf(value) > 0) {
         tempArr.push(value);
      }
   })

   if (detailKeysArr.length !== 0) {

      if (validKeysArr.length -1 === tempArr.length && detailKeysArr.length === tempArr.length) {
         const newReviewData = await customerReviewSchema(newReview);
         await newReviewData.save();
         const updatedList = await customerReviewSchema.find();
         res.json({ mesage: `Updated Customer Review's Lists`, list: updatedList });
      }
      else {
         res.json({ message: `messing Some Keys OR added invalid keys please enter all valid keys to add new Customer Review` })
      }

   }
   else {
      res.json({ message: `No Request` })
   }
})

//api to Edit Customer Review
app.post("/editCustomerReview", async (req, res) => {
   const editInfo = req.body;
   const editInfoId = req.body._id;
   const inputKeysArr = Object.keys(req.body);
   const foundId = await customerReviewSchema.find();
   let idChecked = false;

   console.log(editInfoId);
   console.log(idChecked);

   if (inputKeysArr.length !== 0) {

      foundId.map((list) => {
         if (list._id == editInfoId) {
            return idChecked = true;
         }
      })

      if (idChecked) {
         const updatedCustomerDetail = await customerReviewSchema.findOneAndUpdate({ _id: editInfoId }, {
            $set: {
               customer_id: editInfo.customer_id,
               customer_rating: editInfo.customer_rating,
               customer_review: editInfo.customer_review,
               hotel_id: editInfo.hotel_id
            }
         }, { new: true });

         res.json({ message: `Edited List Of Id: ${editInfoId}`, list: updatedCustomerDetail });

      }
      else {
         res.json({ message: `Id Not Found` });
      }
   }
   else {
      res.json({ message: `No Request` });
   }
})

//api to delete customer review
app.post("/deleteCustomerReview", async (req, res) => {
   const deleteId = req.body._id;
   const inputKeysArr = Object.keys(req.body);
   const findId = await customerReviewSchema.find();
   let idChecked = false;

   if (inputKeysArr.length !== 0) {

      if (inputKeysArr.length === 1) {

         if (inputKeysArr[0] === "_id") {

            findId.map((infoId) => {
               if (infoId._id == deleteId) {
                  return idChecked = true;
               }
            })
            if (idChecked) {
               await customerReviewSchema.findOneAndDelete({ _id: deleteId });
               const deletedList = await customerReviewSchema.find();
               res.json({ message: `List After deletion`, list: deletedList });
            }
            else {
               res.json({ message: `Id Not Found` })
            }
         }
         else {
            res.json({ message: `Please Enter Correct Id Key Name That is _id` })
         }
      }
      else {
         res.json({ mesage: `body Must Contain Only Review Id` })
      }
   }
   else {
      res.json({ message: `No Request` });
   }
})


//EXPRIENCE API's

//api to display exprience list
app.get("/displayListofExprience", async (req, res) => {
   const exprienceList = await exprienceSchema.find();
   res.json(exprienceList);
})

//api to add new exprience in list
app.post("/addNewExprience", async (req, res) => {
   const newReview = req.body
   const detailKeysArr = Object.keys(req.body);
   const validData = await exprienceSchema.find();
   const validKeysArr = Object.keys(validData[0].toObject());
   let tempArr = [];

   detailKeysArr.map((value) => {
      if (validKeysArr.indexOf(value) > 0) {
         tempArr.push(value);
      }
   })

   if (detailKeysArr.length !== 0) {

      if (validKeysArr.length -1 === tempArr.length && detailKeysArr.length === tempArr.length) {
         const newReviewData = await exprienceSchema(newReview);
         await newReviewData.save();
         const updatedList = await exprienceSchema.find();
         res.json({ mesage: `Updated Exprience Lists`, list: updatedList });
      }
      else {
         res.json({ message: `messing Some Keys OR added invalid keys please enter all valid keys to add new Exprience` })
      }

   }
   else {
      res.json({ message: `No Request` })
   }
})

//api to edit exprience list info
app.post("/editExprienceListInfo", async (req, res) => {
   const editInfo = req.body;
   const editInfoId = req.body._id;
   const inputKeysArr = Object.keys(req.body);
   const foundId = await exprienceSchema.find();
   let idChecked = false;

   console.log(editInfoId);
   console.log(idChecked);

   if (inputKeysArr.length !== 0) {

      foundId.map((list) => {
         if (list._id == editInfoId) {
            return idChecked = true;
         }
      })

      if (idChecked) {
         const updatedCustomerDetail = await exprienceSchema.findOneAndUpdate({ _id: editInfoId }, {
            $set: {
               exp_title: editInfo.exp_title,
               exp_descr: editInfo.exp_descr,
               exp_startDate: editInfo.exp_startDate,
               exp_endDate: editInfo.exp_endDate,
               exp_location: editInfo.exp_location,
               exp_price: editInfo.exp_price,
               exp_photo: editInfo.exp_photo,
               review_id: editInfo.review_id,
               host_id: editInfo.host_id

            }
         }, { new: true });

         res.json({ message: `Edited List Of Id: ${editInfoId}`, list: updatedCustomerDetail });

      }
      else {
         res.json({ message: `Id Not Found` });
      }
   }
   else {
      res.json({ message: `No Request` });
   }
})

//api to delete exprience list Data By ID
app.post("/deleteExperienceListData", async (req, res) => {
   const deleteId = req.body._id;
   const inputKeysArr = Object.keys(req.body);
   const findId = await exprienceSchema.find();
   let idChecked = false;

   console.log(deleteId);


   if (inputKeysArr.length !== 0) {

      if (inputKeysArr.length === 1) {

         if (inputKeysArr[0] === "_id") {

            findId.map((infoId) => {
               if (infoId._id == deleteId) {
                  return idChecked = true;
               }
            })
            if (idChecked) {
               await exprienceSchema.findOneAndDelete({ _id: deleteId });
               const deletedList = await exprienceSchema.find();
               res.json({ message: `List After deletion`, list: deletedList });
            }
            else {
               res.json({ message: `Id Not Found` })
            }
         }
         else {
            res.json({ message: `Please Enter Correct Id Key Name That is _id` })
         }
      }
      else {
         res.json({ mesage: `body Must Contain Only Exprience Id` })
      }
   }
   else {
      res.json({ message: `No Request` });
   }
})


//HOST API'S

//api to display all host 
app.get("/displayHost", async (req, res) => {
   const displayHost = await hostDetailSchema.find();
   res.json(displayHost);
})

//api to add new host
app.post("/addNewHost", async (req, res) => {
   const newReview = req.body
   const detailKeysArr = Object.keys(req.body);
   const validData = await hostDetailSchema.find();
   const validKeysArr = Object.keys(validData[0].toObject());
   let tempArr = [];

   detailKeysArr.map((value) => {
      if (validKeysArr.indexOf(value) > 0) {
         tempArr.push(value);
      }
   })

   if (detailKeysArr.length !== 0) {

      if (validKeysArr.length -1 === tempArr.length && detailKeysArr.length === tempArr.length) {
         const newReviewData = await hostDetailSchema(newReview);
         await newReviewData.save();
         const updatedList = await hostDetailSchema.find();
         res.json({ mesage: `Updated Host Lists`, list: updatedList });
      }
      else {
         res.json({ message: `messing Some Keys OR added invalid keys please enter all valid keys to add new Host Detail` })
      }

   }
   else {
      res.json({ message: `No Request` })
   }
})

//api to edit host detail by ID
app.post("/editHostDetail", async (req, res) => {
   const editInfo = req.body;
   const editInfoId = req.body._id;
   const inputKeysArr = Object.keys(req.body);
   const foundId = await hostDetailSchema.find();
   let idChecked = false;

   console.log(editInfoId);
   console.log(idChecked);

   if (inputKeysArr.length !== 0) {

      foundId.map((list) => {
         if (list._id == editInfoId) {
            return idChecked = true;
         }
      })

      if (idChecked) {
         const updatedCustomerDetail = await hostDetailSchema.findOneAndUpdate({ _id: editInfoId }, {
            $set: {
               host_id: editInfo.host_id,
               user_id: editInfo.user_id
            }
         }, { new: true });

         res.json({ message: `Edited List Of Id: ${editInfoId}`, list: updatedCustomerDetail });

      }
      else {
         res.json({ message: `Id Not Found` });
      }
   }
   else {
      res.json({ message: `No Request` });
   }
})

//api to delete host detail by Id
app.post("/deleteHostDetail", async (req, res) => {
   const deleteId = req.body._id;
   const inputKeysArr = Object.keys(req.body);
   const findId = await hostDetailSchema.find();
   let idChecked = false;

   console.log(deleteId);


   if (inputKeysArr.length !== 0) {

      if (inputKeysArr.length === 1) {

         if (inputKeysArr[0] === "_id") {

            findId.map((infoId) => {
               if (infoId._id == deleteId) {
                  return idChecked = true;
               }
            })
            if (idChecked) {
               await hostDetailSchema.findOneAndDelete({ _id: deleteId });
               const deletedList = await hostDetailSchema.find();
               res.json({ message: `List After deletion`, list: deletedList });
            }
            else {
               res.json({ message: `Id Not Found` })
            }
         }
         else {
            res.json({ message: `Please Enter Correct Id Key Name That is _id` })
         }
      }
      else {
         res.json({ mesage: `body Must Contain Only Host Detail Id` })
      }
   }
   else {
      res.json({ message: `No Request` });
   }
})


//HOTEL BOOKING API'S

//api to display list of hotel booked
app.get("/displayHotelBooked", async (req, res) => {
   const hotelBookedList = await bookingSchema.find();
   res.json(hotelBookedList);
})

//api to add new list to hotel Booking
app.post("/addNewHotelBookingList", async (req, res) => {
   const newReview = req.body
   const detailKeysArr = Object.keys(req.body);
   const validData = await bookingSchema.find();
   const validKeysArr = Object.keys(validData[0].toObject());
   let tempArr = [];
   detailKeysArr.map((value) => {
      if (validKeysArr.indexOf(value) > 0) {
         tempArr.push(value);
      }
   })

   if (detailKeysArr.length !== 0) {

      if (validKeysArr.length -1 === tempArr.length && detailKeysArr.length === tempArr.length) {
         const newReviewData = await bookingSchema(newReview);
         await newReviewData.save();
         const updatedList = await bookingSchema.find();
         res.json({ mesage: `Updated Host Lists`, list: updatedList });
      }
      else {
         res.json({ message: `messing Some Keys OR added invalid keys please enter all valid keys to add new Booking ` })
      }
   }
   else {
      res.json({ message: `No Request` })
   }
})

//api to edit hotel Booking Info
app.post("/editHotelBookingList", async (req, res) => {
   const editInfo = req.body;
   const editInfoId = req.body._id;
   const inputKeysArr = Object.keys(req.body);
   const foundId = await bookingSchema.find();
   let idChecked = false;

   console.log(editInfoId);
   console.log(idChecked);

   if (inputKeysArr.length !== 0) {

      foundId.map((list) => {
         if (list._id == editInfoId) {
            return idChecked = true;
         }
      })

      if (idChecked) {
         const updatedCustomerDetail = await bookingSchema.findOneAndUpdate({ _id: editInfoId }, {
            $set: {
               hotel_id: editInfo.hotel_id,
               checkIn_date: editInfo.checkIn_date,
               checkOut_date: editInfo.checkOut_date,
               numberOf_guest: editInfo.numberOf_guest,
               hotel_price: editInfo.hotel_price
            }
         }, { new: true });

         res.json({ message: `Edited List Of Id: ${editInfoId}`, list: updatedCustomerDetail });

      }
      else {
         res.json({ message: `Id Not Found` });
      }
   }
   else {
      res.json({ message: `No Request` });
   }
})

//api to delete hotel Booking by ID
app.post("/deleteHotelBooking", async (req, res) => {
   const deleteId = req.body._id;
   const inputKeysArr = Object.keys(req.body);
   const findId = await bookingSchema.find();
   let idChecked = false;

   console.log(deleteId);


   if (inputKeysArr.length !== 0) {

      if (inputKeysArr.length === 1) {

         if (inputKeysArr[0] === "_id") {

            findId.map((infoId) => {
               if (infoId._id == deleteId) {
                  console.log(`Match ID:${deleteId}`);
                  return idChecked = true;
               }
            })
            if (idChecked) {
               await bookingSchema.findOneAndDelete({ _id: deleteId });
               const deletedList = await bookingSchema.find();
               res.json({ message: `List After deletion`, list: deletedList });
            }
            else {
               res.json({ message: `Id Not Found` })
            }
         }
         else {
            res.json({ message: `Please Enter Correct Id Key Name That is _id` })
         }
      }
      else {
         res.json({ mesage: `body Must Contain Only Hotel Booking Id` })
      }
   }
   else {
      res.json({ message: `No Request` });
   }
})

//checked hotel room available on date
app.post("/hotelBooking", async function (req, res) {
   const checkIn = req.body.checkIn_date;
   const checkOut = req.body.checkOut_date;
   const bookings = await bookingSchema.find({ checkIn_date: checkIn, checkOut_date: checkOut });
   (bookings != null && bookings.length > 0) ? res.json(bookings) : res.json({ message: `Hotel Rooms Are Not Available` });
})


//LOCATION API'S

//api to display hotel location list 
app.get("/displayHotelLocation", async (req, res) => {
   const hotellocationList = await hotelLocationSchema.find();
   res.json(hotellocationList);
})

//api to add new hotel location
app.post("/addNewHotelLocation", async (req, res) => {
   const newReview = req.body
   const detailKeysArr = Object.keys(req.body);
   const validData = await hotelLocationSchema.find();
   const validKeysArr = Object.keys(validData[0].toObject());
   let tempArr = [];
   detailKeysArr.map((value) => {
      if (validKeysArr.indexOf(value) > 0) {
         tempArr.push(value);
      }
   })

   if (detailKeysArr.length !== 0) {

      if (validKeysArr.length -1 === tempArr.length && detailKeysArr.length === tempArr.length) {
         const newReviewData = await hotelLocationSchema(newReview);
         await newReviewData.save();
         const updatedList = await hotelLocationSchema.find();
         res.json({ mesage: `Updated Host Lists`, list: updatedList });
      }
      else {
         res.json({ message: `messing Some Keys OR added invalid keys please enter all valid keys to add new Hotel Location` })
      }

   }
   else {
      res.json({ message: `No Request` })
   }
})

//api to edit hotel location info
app.post("/editHotelLocationInfo", async (req, res) => {
   const editInfo = req.body;
   const editInfoId = req.body._id;
   const inputKeysArr = Object.keys(req.body);
   const foundId = await hotelLocationSchema.find();
   let idChecked = false;

   console.log(editInfoId);
   console.log(idChecked);

   if (inputKeysArr.length !== 0) {

      foundId.map((list) => {
         if (list._id == editInfoId) {
            return idChecked = true;
         }
      })

      if (idChecked) {
         const updatedCustomerDetail = await hotelLocationSchema.findOneAndUpdate({ _id: editInfoId }, {
            $set: {
               latitude: editInfo.latitude,
               longitude: editInfo.longitude,
               hotel_id: editInfo.hotel_id
            }
         }, { new: true });

         res.json({ message: `Edited List Of Id: ${editInfoId}`, list: updatedCustomerDetail });

      }
      else {
         res.json({ message: `Id Not Found` });
      }
   }
   else {
      res.json({ message: `No Request` });
   }
})

//api to delete Hotel Location Info by Id
app.post("/deleteHotelLocationInfo", async (req, res) => {
   const deleteId = req.body._id;
   const inputKeysArr = Object.keys(req.body);
   const findId = await hotelLocationSchema.find();
   let idChecked = false;

   console.log(deleteId);

   if (inputKeysArr.length !== 0) {

      if (inputKeysArr.length === 1) {

         if (inputKeysArr[0] === "_id") {

            findId.map((infoId) => {
               if (infoId._id == deleteId) {
                  console.log(`Match ID:${deleteId}`);
                  return idChecked = true;
               }
            })
            if (idChecked) {
               await hotelLocationSchema.findOneAndDelete({ _id: deleteId });
               const deletedList = await hotelLocationSchema.find();
               res.json({ message: `List After deletion`, list: deletedList });
            }
            else {
               res.json({ message: `Id Not Found` })
            }
         }
         else {
            res.json({ message: `Please Enter Correct Id Key Name That is _id` })
         }
      }
      else {
         res.json({ mesage: `body Must Contain Only Hotel Location Id` })
      }
   }
   else {
      res.json({ message: `No Request` });
   }
})


//OFFER API'S

//api to display all offer
app.get("/displayOffer", async (req, res) => {
   const offerList = await hotelOfferSchema.find();
   res.json(offerList);
})

//api to add new Offer in list
app.post("/addNewOffer", async (req, res) => {
   const newReview = req.body
   const detailKeysArr = Object.keys(req.body);
   const validData = await hotelOfferSchema.find();
   const validKeysArr = Object.keys(validData[0].toObject());
   let tempArr = [];
   detailKeysArr.map((value) => {
      if (validKeysArr.indexOf(value) > 0) {
         tempArr.push(value);
      }
   })

   if (detailKeysArr.length !== 0) {

      if (validKeysArr.length-1 === tempArr.length && detailKeysArr.length === tempArr.length) {
         const newReviewData = await hotelOfferSchema(newReview);
         await newReviewData.save();
         const updatedList = await hotelOfferSchema.find();
         res.json({ mesage: `Updated Host Lists`, list: updatedList });
      }
      else {
         res.json({ message: `messing Some Keys OR added invalid keys please enter all valid keys to add new Hotel Offer` })
      }
   }
   else {
      res.json({ message: `No Request` })
   }
})

//api to edit offer List by Id
app.post("/editOfferList", async (req, res) => {
   const editInfo = req.body;
   const editInfoId = req.body._id;
   const inputKeysArr = Object.keys(req.body);
   const foundId = await hotelOfferSchema.find();
   let idChecked = false;

   console.log(editInfoId);
   console.log(idChecked);

   if (inputKeysArr.length !== 0) {

      foundId.map((list) => {
         if (list._id == editInfoId) {
            return idChecked = true;
         }
      })

      if (idChecked) {
         const updatedCustomerDetail = await hotelOfferSchema.findOneAndUpdate({ _id: editInfoId }, {
            $set: {
               offer_id: editInfo.offer_id,
               offer_type: editInfo.offer_type,
               offer_descr: editInfo.offer_descr
            }
         }, { new: true });

         res.json({ message: `Edited List Of Id: ${editInfoId}`, list: updatedCustomerDetail });
      }
      else {
         res.json({ message: `Id Not Found` });
      }
   }
   else {
      res.json({ message: `No Request` });
   }
})

//api to delete offer list info by Id
app.post("/deleteOfferListInfo", async (req, res) => {
   const deleteId = req.body._id;
   const inputKeysArr = Object.keys(req.body);
   const findId = await hotelOfferSchema.find();
   let idChecked = false;

   console.log(deleteId);

   if (inputKeysArr.length !== 0) {

      if (inputKeysArr.length === 1) {

         if (inputKeysArr[0] === "_id") {

            findId.map((infoId) => {
               if (infoId._id == deleteId) {
                  console.log(`Match ID:${deleteId}`);
                  return idChecked = true;
               }
            })
            if (idChecked) {
               await hotelOfferSchema.findOneAndDelete({ _id: deleteId });
               const deletedList = await hotelOfferSchema.find();
               res.json({ message: `List After deletion`, list: deletedList });
            }
            else {
               res.json({ message: `Id Not Found` })
            }
         }
         else {
            res.json({ message: `Please Enter Correct Id Key Name That is _id` })
         }
      }
      else {
         res.json({ mesage: `body Must Contain Only Hotel Offer Id` })
      }
   }
   else {
      res.json({ message: `No Request` });
   }
})


//HOTEL ROOM LIST API'S

//api to display hotel room list
app.get("/dispayHotelRoomListInfo", async (req, res) => {
   const hotelRoomList = await hotelRoomSchema.find();
   res.json(hotelRoomList);
})

//api to add new hotel room info
app.post("/addNewRoomDetail", async (req, res) => {
   const newReview = req.body
   const detailKeysArr = Object.keys(req.body);
   const validData = await hotelRoomSchema.find();
   const validKeysArr = Object.keys(validData[0].toObject());
   let tempArr = [];
   detailKeysArr.map((value) => {
      if (validKeysArr.indexOf(value) > 0) {
         tempArr.push(value);
      }
   })
console.log(`valid length ${validKeysArr.length} tem length${tempArr.length} data length${detailKeysArr.length}`);
   if (detailKeysArr.length !== 0) {

      if (validKeysArr.length-1 === tempArr.length && detailKeysArr.length === tempArr.length) {
         const newReviewData = await hotelRoomSchema(newReview);
         await newReviewData.save();
         const updatedList = await hotelRoomSchema.find();
         res.json({ mesage: `Updated Host Lists`, list: updatedList });
      }
      else {
         res.json({ message: `messing Some Keys please enter all keys to add new Room detail OR added invalid keys` })
      }
   }
   else {
      res.json({ message: `No Request` })
   }
})

//api to edit hotel room detal
app.post("/editRoomDetail", async (req, res) => {
   const editInfo = req.body;
   const editInfoId = req.body._id;
   const inputKeysArr = Object.keys(req.body);
   const foundId = await hotelRoomSchema.find();
   let idChecked = false;

   console.log(editInfoId);
   console.log(idChecked);

   if (inputKeysArr.length !== 0) {

      foundId.map((list) => {
         if (list._id == editInfoId) {
            return idChecked = true;
         }
      })

      if (idChecked) {
         const updatedCustomerDetail = await hotelRoomSchema.findOneAndUpdate({ _id: editInfoId }, {
            $set: {
               hotel_id: editInfo.hotel_id,
               room_type: editInfo.room_type,
               room_capacity: editInfo.room_capacity,
               room_price: editInfo.room_price,
               room_availability: editInfo.room_availability
            }
         }, { new: true });

         res.json({ message: `Edited List Of Id: ${editInfoId}`, list: updatedCustomerDetail });

      }
      else {
         res.json({ message: `Id Not Found` });
      }
   }
   else {
      res.json({ message: `No Request` });
   }
})

//api to delete Room detail by Id
app.post("/deleteRoomDetailInfo", async (req, res) => {
   const deleteId = req.body._id;
   const inputKeysArr = Object.keys(req.body);
   const findId = await hotelRoomSchema.find();
   let idChecked = false;

   console.log(deleteId);

   if (inputKeysArr.length !== 0) {

      if (inputKeysArr.length === 1) {

         if (inputKeysArr[0] === "_id") {

            findId.map((infoId) => {
               if (infoId._id == deleteId) {
                  console.log(`Match ID:${deleteId}`);
                  return idChecked = true;
               }
            })
            if (idChecked) {
               await hotelRoomSchema.findOneAndDelete({ _id: deleteId });
               const deletedList = await hotelRoomSchema.find();
               res.json({ message: `List After deletion`, list: deletedList });
            }
            else {
               res.json({ message: `Id Not Found` })
            }
         }
         else {
            res.json({ message: `Please Enter Correct Id Key Name That is _id` })
         }
      }
      else {
         res.json({ mesage: `body Must Contain Only Hotel Room Detail Id` })
      }
   }
   else {
      res.json({ message: `No Request` });
   }
})


// HOTEL PHOTOS API'S

//api to display all hotel photo list
app.get("/displayHotelPhotosList", async (req, res) => {
   const hotelPhotosList = await hotelPhotosSchema.find();
   res.json(hotelPhotosList);
})

//api to add new hotel photos
app.post("/addNewHotelPhotos", async (req, res) => {
   const newReview = req.body
   const detailKeysArr = Object.keys(req.body);
   const validData = await hotelPhotosSchema.find();
   const validKeysArr = Object.keys(validData[0].toObject());
   let tempArr = [];
   detailKeysArr.map((value) => {
      if (validKeysArr.indexOf(value) > 0) {
         tempArr.push(value);
      }
   })

   if (detailKeysArr.length !== 0) {

      if (validKeysArr.length-1 === tempArr.length && detailKeysArr.length === tempArr.length) {
         const newReviewData = await hotelPhotosSchema(newReview);
         await newReviewData.save();
         const updatedList = await hotelPhotosSchema.find();
         res.json({ mesage: `Updated Host Lists`, list: updatedList });
      }
      else {
         res.json({ message: `messing Some Keys please enter all keys to add new Hotel Photos OR added invalid keys` })
      }

   }
   else {
      res.json({ message: `No Request` })
   }
})

//api to edit Hotel Room photos detail
app.post("/editHotelPhotosList", async (req, res) => {
   const editInfo = req.body;
   const editInfoId = req.body._id;
   const inputKeysArr = Object.keys(req.body);
   const foundId = await hotelPhotosSchema.find();
   let idChecked = false;

   console.log(editInfoId);
   console.log(idChecked);

   if (inputKeysArr.length !== 0) {

      foundId.map((list) => {
         if (list._id == editInfoId) {
            return idChecked = true;
         }
      })

      if (idChecked) {
         const updatedCustomerDetail = await hotelPhotosSchema.findOneAndUpdate({ _id: editInfoId }, {
            $set: {
               hotel_id: editInfo.hotel_id,
               image_path: editInfo.image_path,
               type: editInfo.type
            }
         }, { new: true });

         res.json({ message: `Edited List Of Id: ${editInfoId}`, list: updatedCustomerDetail });

      }
      else {
         res.json({ message: `Id Not Found` });
      }
   }
   else {
      res.json({ message: `No Request` });
   }
})

//api to delete hotel photo list
app.post("/deleteHotelPhotosList", async (req, res) => {
   const deleteId = req.body._id;
   const inputKeysArr = Object.keys(req.body);
   const findId = await hotelPhotosSchema.find();
   let idChecked = false;

   console.log(deleteId);

   if (inputKeysArr.length !== 0) {

      if (inputKeysArr.length === 1) {

         if (inputKeysArr[0] === "_id") {

            findId.map((infoId) => {
               if (infoId._id == deleteId) {
                  console.log(`Match ID:${deleteId}`);
                  return idChecked = true;
               }
            })
            if (idChecked) {
               await hotelPhotosSchema.findOneAndDelete({ _id: deleteId });
               const deletedList = await hotelPhotosSchema.find();
               res.json({ message: `List After deletion`, list: deletedList });
            }
            else {
               res.json({ message: `Id Not Found` })
            }
         }
         else {
            res.json({ message: `Please Enter Correct Id Key Name That is _id` })
         }
      }
      else {
         res.json({ mesage: `body Must Contain Only Hotel Photos List Id` })
      }
   }
   else {
      res.json({ message: `No Request` });
   }
})


//HOTEL FACILITIES API'S

//api to display hotel facilities list info
app.get("/displayHotelFacilitiesList", async (req, res) => {
   const hotelFacilitiesList = await hotelFacilitiesSchema.find();
   res.json(hotelFacilitiesList);
})

//api to add new hotel Facilities List
app.post("/addNewHotelFacilitiesList", async (req, res) => {
   const newReview = req.body
   const detailKeysArr = Object.keys(req.body);
   const validData = await hotelFacilitiesSchema.find();
   const validKeysArr = Object.keys(validData[0].toObject());
   let tempArr = [];
   detailKeysArr.map((value) => {
      if (validKeysArr.indexOf(value) > 0) {
         tempArr.push(value);
      }
   })
   console.log(`tempARR: ${tempArr}`);
   console.log(`validARR: ${detailKeysArr}`);
   console.log(`input Keys: ${detailKeysArr.length} & data Keys: ${validKeysArr.length - 1}`);

   if (detailKeysArr.length !== 0) {

      if (validKeysArr.length-1 === tempArr.length && detailKeysArr.length === tempArr.length) {
         const newReviewData = await hotelFacilitiesSchema(newReview);
         await newReviewData.save();
         const updatedList = await hotelFacilitiesSchema.find();
         res.json({ mesage: `Updated Host Lists`, list: updatedList });
      }
      else {
         res.json({ message: `messing Some Keys please enter all keys to add new facilities OR added invalid keys` })
      }
   }
   else {
      res.json({ message: `No Request` })
   }
})

//edit hotel facilities list 
app.post("/editHotelFacilitiesList", async (req, res) => {
   const editInfo = req.body;
   const editInfoId = req.body._id;
   const inputKeysArr = Object.keys(req.body);
   const foundId = await hotelFacilitiesSchema.find();
   let idChecked = false;

   console.log(editInfoId);
   console.log(idChecked);

   if (inputKeysArr.length !== 0) {

      foundId.map((list) => {
         if (list._id == editInfoId) {
            return idChecked = true;
         }
      })

      if (idChecked) {
         const updatedCustomerDetail = await hotelFacilitiesSchema.findOneAndUpdate({ _id: editInfoId }, {
            $set: {
               facilities_id: editInfo.facilities_id,
               facilities_name: editInfo.facilities_name,
               icon_path: editInfo.icon_path
            }
         }, { new: true });

         res.json({ message: `Edited List Of Id: ${editInfoId}`, list: updatedCustomerDetail });

      }
      else {
         res.json({ message: `Id Not Found` });
      }
   }
   else {
      res.json({ message: `No Request` });
   }
})

//api to delete hotel Facilities list
app.post("/deleteHotelFacelitiesList", async (req, res) => {
   const deleteId = req.body._id;
   const inputKeysArr = Object.keys(req.body);
   const findId = await hotelFacilitiesSchema.find();
   let idChecked = false;

   console.log(deleteId);

   if (inputKeysArr.length !== 0) {

      if (inputKeysArr.length === 1) {

         if (inputKeysArr[0] === "_id") {

            findId.map((infoId) => {
               if (infoId._id == deleteId) {
                  console.log(`Match ID:${deleteId}`);
                  return idChecked = true;
               }
            })
            if (idChecked) {
               await hotelFacilitiesSchema.findOneAndDelete({ _id: deleteId });
               const deletedList = await hotelFacilitiesSchema.find();
               res.json({ message: `List After deletion`, list: deletedList });
            }
            else {
               res.json({ message: `Id Not Found` })
            }
         }
         else {
            res.json({ message: `Please Enter Correct Id Key Name That is _id` })
         }
      }
      else {
         res.json({ mesage: `body Must Contain Only Hotel Facilities List Id` })
      }
   }
   else {
      res.json({ message: `No Request` });
   }
})




app.listen(8080, () => console.log(`Server Started`));