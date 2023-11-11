
const user = require("../schema/customerDetailsSchema");
const {createToken} = require("../src/auth");
const bcrypt = require("bcrypt");


module.exports.singUp = async (req, res, callBack) => {
  try {
    const {
      first_name,
      last_name,
      customer_email,
      customer_pass,
      customer_ph,
    } = req.body;

    const existingUser = await user.findOne({ customer_email });

    if (existingUser) {
      return res.json({ message: `User Already Exist` });
    }

    const newUser = await user.create({
      first_name,
      last_name,
      customer_email,
      customer_pass,
      customer_ph,
    });

    const token = createToken(newUser._id);
    res.cookie("token", token, {withCredentials: true, sameSite:"none" , httpOnly: false , secure: true});
    res.json({
      message: `User Register Sucessfully`,
      token: token,
      id: newUser._id,
    });
    callBack();
  } catch (error) {
    console.log(`Error: ${error}`);
  }
};


module.exports.singIn = async (req, res, callBack) => {

  try {

    const { customer_email, customer_pass } = req.body;

    if (customer_email === null || customer_pass === null || customer_email === "" || customer_pass === "") {
      return res.json({ message: `Please Fill All Fields` });

    }
    const userAvailable = await user.findOne({ customer_email });

    if (!userAvailable) {
      return res.json({ message: `Please enter Correct Login Credentials` });
    }

    const userExist = await bcrypt.compare(
      customer_pass,
      userAvailable.customer_pass
    );

    if (!userExist) {
      return res.json({ message: `Please enter Correct Login Credentials` });
    }

    token = createToken(userAvailable._id);

    res.cookie("token", token, {withCredentials: true, httpOnly: false});

    res.json({ message: `Login Sucessful`, userId: userAvailable._id ,token: token });
    callBack();
  } catch (error) {
    console.log(error);
  }

};


