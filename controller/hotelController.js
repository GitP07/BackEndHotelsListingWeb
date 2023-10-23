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
