// registering users adding users
const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator/check'); //express validator for making name mandaotory , email type email and password length minimum six

const User = require('../../models/User');
//@route   POST api/posts
//@desc    Register user
//@access  Public
router.post(
  '/',
  [
    check('name', 'Name is required')
      .not()
      .isEmpty(),
    check('email', 'Please enter a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      //if above errors variable is not empty then it means we have error
      return res.status(400).json({ errors: errors.array() }); //Bad request meaning server will not process request
    }

    const { name, email, password } = req.body;

    try {
      //See if user exists
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }

      //Get users gravatar
      const avatar = gravatar.url(email, {
        s: '200', //default size
        r: 'pg', //naked people not allowed in gravatar
        d: 'mm' //default image means to give some image even if there is no image
      });
      //if user do not exist then create a user
      user = new User({
        name,
        email,
        avatar,
        password
      });
      //Encrypt password

      const salt = await bcrypt.genSalt(10); //create salt using bcrypt.genSalt with strenght of 10

      user.password = await bcrypt.hash(password, salt); //now take the password and hash it

      await user.save(); //to save in database
      //Return jsonwebtoken - so that when user register then it will have json web token so that they can use that token to authenticate/access protected routes

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 3600000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error'); //Server error
    }
  }
);

module.exports = router;
