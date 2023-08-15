const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const UserService = require('../user');
const separateFullNameToArray = require('../../utils/additional_data_processing');

passport.use(new FacebookStrategy({
	clientID: process.env.FACEBOOK_APP_ID,
	clientSecret: process.env.FACEBOOK_APP_SECRET,
	callbackURL: process.env.CALLBACK_URL_FACEBOOK,
	profileFields: ['id', "email", 'displayName', 'gender', 'photos']
},
	async (accessToken, refreshToken, profile, done) => {
		const fullNameArr = separateFullNameToArray(profile.displayName);
		const id = profile.id;
		const email = profile.email ? profile.email : '';
		const firstName = fullNameArr[0];
		const lastName = fullNameArr[1];
		const profilePhoto = profile.photos ? profile.photos[0].value : '';


		const currentUser = await UserService.getUserById({ id })
		console.log('current user by email FACEBOOK', currentUser);

		if (!currentUser) {
			const newUser = await UserService.addFacebookUser({
				id,
				email,
				firstName,
				lastName,
				profilePhoto
			})
			return done(null, newUser);
		}

		if (currentUser.source != "facebook") {
			//return error
			return done(null, false, { message: `You have previously signed up with a different signin method` });
		}

		currentUser.lastVisited = new Date();
		return done(null, currentUser);
	}
	// function (accessToken, refreshToken, profile, done) {
	// 	console.log(profile)
	// 	return done(null, profile);
	// }

	// function (accessToken, refreshToken, profile, cb) {
	// 	db.get('SELECT * FROM federated_credentials WHERE provider = ? AND subject = ?', [
	// 		'https://www.facebook.com',
	// 		profile.id
	// 	]),
	// 		function (err, cred) {
	// 			if (err) { return cb(err); }
	// 			if (!cred) {
	// 				// The Facebook account has not logged in to this app before.  Create a
	// 				// new user record and link it to the Facebook account.
	// 				db.run('INSERT INTO users (name) VALUES (?)', [
	// 					profile.displayName
	// 				], function (err) {
	// 					if (err) { return cb(err); }

	// 					var id = this.lastID;
	// 					db.run('INSERT INTO federated_credentials (user_id, provider, subject) VALUES (?, ?, ?)', [
	// 						id,
	// 						'https://www.facebook.com',
	// 						profile.id
	// 					], function (err) {
	// 						if (err) { return cb(err); }
	// 						var user = {
	// 							id: id.toString(),
	// 							name: profile.displayName
	// 						};
	// 						return cb(null, user);
	// 					});
	// 				});
	// 			} else {
	// 				// The Facebook account has previously logged in to the app.  Get the
	// 				// user record linked to the Facebook account and log the user in.
	// 				db.get('SELECT * FROM users WHERE id = ?', [cred.user_id], function (err, user) {
	// 					if (err) { return cb(err); }
	// 					if (!user) { return cb(null, false); }
	// 					return cb(null, user);
	// 				});
	// 			}
	// 		};
	// }
));