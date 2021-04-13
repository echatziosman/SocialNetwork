const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { body, validationResult } = require('express-validator');

//@route    GET api/profile/me
//@desc     Get current users profile
//@access   Private

router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error..');
  }
});

//@route    POST api/profile
//@desc     Create or Update user profıle
//@access   Private

router.post(
  '/',
  [
    auth,
    [
      body('status', 'Status is required').not().isEmpty(),
      body('skills', 'Your skills are required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      website,
      githubusername,
      bio,
      skills,
      location,
      status,
      facebook,
      twitter,
      linkedin,
      instagram,
      youtube,
    } = req.body;

    // Profil Objesini Olusturma
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (githubusername) profileFields.githubusername = githubusername;
    if (bio) profileFields.bio = bio;
    if (location) profileFields.location = location;
    if (status) profileFields.status = status;
    if (skills) {
      profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    // Social Objesini Olusturma
    profileFields.social = {};
    if (facebook) profileFields.social.facebook = facebook;
    if (youtube) profileFields.social.youtube = youtube;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        // Update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }
      // create a profile
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server Error...');
    }
  }
);

module.exports = router;
