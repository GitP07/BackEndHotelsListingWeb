const { set } = require('mongoose');
const hotelSchema = require('../schema/hotelSchema');

module.exports.hotelRoomList = async (req, res) => {
    const hotelList = await hotelSchema.find();
    hotelList.length > 0 ? res.json(hotelList) : res.json({ message: `Rooms Are Not Available` });
}

module.exports.hotelsRoomsInArea = async (req, res) => {
    const area = req.body.hotel_address;
    const hotelDetail = await hotelSchema.find({ hotel_address: area });
    (hotelDetail != null && hotelDetail.length > 0) ? res.json(hotelDetail) : res.json({ message: `Rooms Are Not Available In ${area}` })
}

module.exports.hotelRoomDetailById = async (req, res) => {
    const hotelId = req.params.id;
    const hotelRoomInfo = await hotelSchema.findOne({ _id: hotelId });

    console.log(`id:${hotelId}`);
    res.json(hotelRoomInfo);
}


module.exports.hotelRoomByName = async (req, res) => {

    const hotel_name = req.params.hotelName;
    const hotelRooms = await hotelSchema.find({ hotel_name: { $regex: hotel_name, $options: 'i' } });
    if (hotelRooms.length > 0) {
        res.json(hotelRooms);
    }
    else {
        res.json({ message: `no hotel available` })
    }

}

module.exports.hotelSearchOptionNames = async (req, res) => {
    const hotel_name = req.body.hotel_name;
    const hotelNames = [];

    const hotelRooms = await hotelSchema.find({ hotel_name: { $regex: hotel_name, $options: 'i' } });
    if (hotelRooms.length > 0) {
        hotelRooms.map((hotels) => {
            hotelNames.push({ hotel_name: hotels.hotel_name });
        })

        res.json(hotelNames);
    }
    else {

        res.json({ message: `no hotel available` })
    }
}



module.exports.hotelRoomRatingList = async (req, res) => {
    const allRoomsRating = await hotelSchema.find({}, 'hotel_rating');
    let tempArr = [];
    allRoomsRating.map((rating) => {
        tempArr.push(Math.floor(rating.hotel_rating))
    })
    const ratingNumList = [... new Set(tempArr)]
    res.json(ratingNumList)
}

module.exports.hotelRoomListByRating = async (req, res) => {
    const hotel_rating = req.body.hotel_rating;
    const allHotelRooms = await hotelSchema.find();
    let hotelList = [];

    allHotelRooms.map((rating) => {
        if (hotel_rating === Math.floor(rating.hotel_rating)) {
            hotelList.push(rating);
        }
    })

    if(hotelList.length !== 0 && hotelList !== null){
        res.json(hotelList);
    }
    else{
        res.json({message:`Hotel Room With Rating ${hotel_rating} Not Available`})
    }

}

module.exports.priceDescendingHotelList = async (req, res) =>{
    const hotelList = await hotelSchema.find().sort('-room_price');
    hotelList ? res.json(hotelList) : res.json({message:`Hotel List Not Available`});
}

module.exports.priceAscendingHotelList = async (req, res) =>{
    const hotelList = await hotelSchema.find().sort('room_price');
    hotelList ? res.json(hotelList) : res.json({message:`Hotel List Not Available`});
}