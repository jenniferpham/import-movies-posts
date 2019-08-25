'use strict';
const fs = require('fs');
const csv = require('csvtojson');
const moment = require('moment');

// WORDPRESS WP-ADMIN > Tools > Export > Movies (custom post type) -> xml file format
// Download Google sheet and save as csv file and clean up data (split Production info to DIrector, Country Runtime minutes)
const csvFilePath = './data/movies.csv';

// PREP CSV file:
// rename column names to match the custom field names
// split production info into director, year, runtime(movie_length) and remove "min"
// change Language to match dropdown
// prep photos to match movie name
// categories split by comma and one space (no new lines)
// fix production staff names to have commas instead of newlines or &s
// fix Additional Credits to have parentheses with job title


const folder = `./response`;
// create folder with date
if (!fs.existsSync(folder)) {
	fs.mkdirSync(folder);
}
const finalXMLFile = `${folder}/movies-posts-new.xml`;
let xmlContent = '';

// Got intro from Wp-Admin > Tools > Export
const intro = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0"
	xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"
	xmlns:content="http://purl.org/rss/1.0/modules/content/"
	xmlns:wfw="http://wellformedweb.org/CommentAPI/"
	xmlns:dc="http://purl.org/dc/elements/1.1/"
	xmlns:wp="http://wordpress.org/export/1.2/"
>

<channel>
	<title>VAALA Presents 2019 Viet Film Fest</title>
	<link>http://www.vietfilmfest.com</link>
	<description>Sharing the Vietnamese experience through film</description>
	<pubDate>Sat, 24 Aug 2019 18:31:21 +0000</pubDate>
	<language>en-US</language>
	<wp:wxr_version>1.2</wp:wxr_version>
	<wp:base_site_url>http://www.vietfilmfest.com</wp:base_site_url>
	<wp:base_blog_url>http://www.vietfilmfest.com</wp:base_blog_url>

	<wp:author><wp:author_id>1</wp:author_id><wp:author_login><![CDATA[Jennifer]]></wp:author_login><wp:author_email><![CDATA[jennifer@jenniferpham.biz]]></wp:author_email><wp:author_display_name><![CDATA[admin]]></wp:author_display_name><wp:author_first_name><![CDATA[]]></wp:author_first_name><wp:author_last_name><![CDATA[]]></wp:author_last_name></wp:author>


	<generator>https://wordpress.org/?v=4.9.7</generator>

<image>
	<url>http://www.vietfilmfest.com/wp-content/uploads/2019/03/cropped-VFF-logo-icon-32x32.jpg</url>
	<title>VAALA Presents 2019 Viet Film Fest</title>
	<link>http://www.vietfilmfest.com</link>
	<width>32</width>
	<height>32</height>
</image>
`;

const end = `
</channel>
</rss>
`;

xmlContent += intro;

csv().fromFile(csvFilePath).then((movies) => {
	// Convert CSV to JSON
	fs.writeFileSync('./data/movies-data.json', JSON.stringify(movies));


	// loop through movies json
	// use template and keep appending to file
	let postId = 2241;
	for (let movie of movies) {
		// movie title with dashes (no sapces) and remove special characters
		const postName = movie.title.toLowerCase().replace(/\s/g, "-").replace(/[!@#$%^&*]/g, "");
		// changes genre into categories array
		const categories = movie.categories ? movie.categories.split(", ") : [];
		let categoriesXml = "";
		if (categories.length > 0) {
			categoriesXml += categories.reduce((total, category) => total + `<category domain="category" nicename="${category.toLowerCase()}"><![CDATA[${category}]]></category>\n`, "");
		}

		const setValues = movie.set.split(", ");
		let setValueStr = '{';
		for (let i = 0; i < setValues.length; i++) {
			const setNumber = setValues[i];
			setValueStr += `i:${i};s:${setNumber.length}:"${setNumber}";`;
		};
		setValueStr += '}';
		const setValueMetaValue = `<wp:meta_value><![CDATA[a:${setValues.length}:${setValueStr}]]></wp:meta_value>`;

		let credits = ["Producer", "Writer", "Cinematographer", "Sound", "Editor", "Lead Actor/Actress", "Supporting Actor/Actress", "Additional Credits"];

		let productionStaffRepeater = '';
		let creditIndex = 0;
		for (let credit of credits) {
			if (movie[credit]) {
				productionStaffRepeater += `
			<wp:postmeta>
				<wp:meta_key><![CDATA[production_staff_repeater_${creditIndex}_production_job]]></wp:meta_key>
				<wp:meta_value><![CDATA[${credit}]]></wp:meta_value>
			</wp:postmeta>
			<wp:postmeta>
				<wp:meta_key><![CDATA[_production_staff_repeater_${creditIndex}_production_job]]></wp:meta_key>
				<wp:meta_value><![CDATA[field_5b7e10f5aa692]]></wp:meta_value>
			</wp:postmeta>
			<wp:postmeta>
				<wp:meta_key><![CDATA[production_staff_repeater_${creditIndex}_production_name]]></wp:meta_key>
				<wp:meta_value><![CDATA[${movie[credit]}]]></wp:meta_value>
			</wp:postmeta>
			<wp:postmeta>
				<wp:meta_key><![CDATA[_production_staff_repeater_${creditIndex}_production_name]]></wp:meta_key>
				<wp:meta_value><![CDATA[field_5b7e118eaa693]]></wp:meta_value>
			</wp:postmeta>\n`;
				creditIndex++;
			}
		};
		productionStaffRepeater += `
	<wp:postmeta>
		<wp:meta_key><![CDATA[production_staff_repeater]]></wp:meta_key>
		<wp:meta_value><![CDATA[${credits.length}]]></wp:meta_value>
	</wp:postmeta>
	<wp:postmeta>
		<wp:meta_key><![CDATA[_production_staff_repeater]]></wp:meta_key>
		<wp:meta_value><![CDATA[field_5b7e10e5aa691]]></wp:meta_value>
	</wp:postmeta>\n`;

		const currentDate = moment().format("YYYY-MM-DD HH:mm:ss");
		const longDate = moment().format("ddd, DD MMM YYYY HH:mm:ss");

		const template =
			`<item>
		<title>${movie.title}</title>
		<link>http://www.vietfilmfest.com/movie/${postName}/</link>
		<pubDate>${longDate} +0000</pubDate>
		<dc:creator><![CDATA[Jennifer]]></dc:creator>
		<guid isPermaLink="false">http://www.vietfilmfest.com/?post_type=movie&#038;p=${postId}</guid>
		<description></description>
		<content:encoded><![CDATA[]]></content:encoded>
		<excerpt:encoded><![CDATA[]]></excerpt:encoded>
		<wp:post_id>${postId}</wp:post_id>
		<wp:post_date><![CDATA[${currentDate}]]></wp:post_date>
		<wp:post_date_gmt><![CDATA[${currentDate}]]></wp:post_date_gmt>
		<wp:comment_status><![CDATA[closed]]></wp:comment_status>
		<wp:ping_status><![CDATA[closed]]></wp:ping_status>
		<wp:post_name><![CDATA[${postName}]]></wp:post_name>
		<wp:status><![CDATA[publish]]></wp:status>
		<wp:post_parent>0</wp:post_parent>
		<wp:menu_order>0</wp:menu_order>
		<wp:post_type><![CDATA[movie]]></wp:post_type>
		<wp:post_password><![CDATA[]]></wp:post_password>
		<wp:is_sticky>0</wp:is_sticky>
		${categoriesXml}
		<wp:postmeta>
			<wp:meta_key><![CDATA[_edit_last]]></wp:meta_key>
			<wp:meta_value><![CDATA[1]]></wp:meta_value>
		</wp:postmeta>
		<wp:postmeta>
			<wp:meta_key><![CDATA[trailer]]></wp:meta_key>
			<wp:meta_value><![CDATA[${movie.trailer}]]></wp:meta_value>
		</wp:postmeta>
		<wp:postmeta>
			<wp:meta_key><![CDATA[_trailer]]></wp:meta_key>
			<wp:meta_value><![CDATA[field_56d16a7004872]]></wp:meta_value>
		</wp:postmeta>
		<wp:postmeta>
			<wp:meta_key><![CDATA[trailer_desc]]></wp:meta_key>
			<wp:meta_value><![CDATA[]]></wp:meta_value>
		</wp:postmeta>
		<wp:postmeta>
			<wp:meta_key><![CDATA[_trailer_desc]]></wp:meta_key>
			<wp:meta_value><![CDATA[field_5bafa7f5e82b0]]></wp:meta_value>
		</wp:postmeta>
		<wp:postmeta>
			<wp:meta_key><![CDATA[film_link]]></wp:meta_key>
			<wp:meta_value><![CDATA[]]></wp:meta_value>
		</wp:postmeta>
		<wp:postmeta>
			<wp:meta_key><![CDATA[_film_link]]></wp:meta_key>
			<wp:meta_value><![CDATA[field_5bf4a9ba77730]]></wp:meta_value>
		</wp:postmeta>
		<wp:postmeta>
			<wp:meta_key><![CDATA[synopsis_author]]></wp:meta_key>
			<wp:meta_value><![CDATA[]]></wp:meta_value>
		</wp:postmeta>
		<wp:postmeta>
			<wp:meta_key><![CDATA[_synopsis_author]]></wp:meta_key>
			<wp:meta_value><![CDATA[field_5b90fe0a53763]]></wp:meta_value>
		</wp:postmeta>
		<wp:postmeta>
			<wp:meta_key><![CDATA[synopsis]]></wp:meta_key>
			<wp:meta_value><![CDATA[${movie.synopsis}]]></wp:meta_value>
		</wp:postmeta>
		<wp:postmeta>
			<wp:meta_key><![CDATA[_synopsis]]></wp:meta_key>
			<wp:meta_value><![CDATA[field_56d16a5d460da]]></wp:meta_value>
		</wp:postmeta>
		<wp:postmeta>
			<wp:meta_key><![CDATA[synopsis_viet]]></wp:meta_key>
			<wp:meta_value><![CDATA[]]></wp:meta_value>
		</wp:postmeta>
		<wp:postmeta>
			<wp:meta_key><![CDATA[_synopsis_viet]]></wp:meta_key>
			<wp:meta_value><![CDATA[field_5b90fe574345c]]></wp:meta_value>
		</wp:postmeta>
		<wp:postmeta>
			<wp:meta_key><![CDATA[attendance]]></wp:meta_key>
			<wp:meta_value><![CDATA[]]></wp:meta_value>
		</wp:postmeta>
		<wp:postmeta>
			<wp:meta_key><![CDATA[_attendance]]></wp:meta_key>
			<wp:meta_value><![CDATA[field_56fc8b80bbc77]]></wp:meta_value>
		</wp:postmeta>
		<wp:postmeta>
			<wp:meta_key><![CDATA[screenshots]]></wp:meta_key>
			<wp:meta_value><![CDATA[]]></wp:meta_value>
		</wp:postmeta>
		<wp:postmeta>
			<wp:meta_key><![CDATA[_screenshots]]></wp:meta_key>
			<wp:meta_value><![CDATA[field_56d20259950a9]]></wp:meta_value>
		</wp:postmeta>
		<wp:postmeta>
			<wp:meta_key><![CDATA[screenshot_slider]]></wp:meta_key>
			<wp:meta_value><![CDATA[]]></wp:meta_value>
		</wp:postmeta>
		<wp:postmeta>
			<wp:meta_key><![CDATA[_screenshot_slider]]></wp:meta_key>
			<wp:meta_value><![CDATA[field_5b873ee97a2ba]]></wp:meta_value>
		</wp:postmeta>
		<wp:postmeta>
			<wp:meta_key><![CDATA[set]]></wp:meta_key>
			${setValueMetaValue}
		</wp:postmeta>
		<wp:postmeta>
			<wp:meta_key><![CDATA[_set]]></wp:meta_key>
			<wp:meta_value><![CDATA[field_5b7e0df01f509]]></wp:meta_value>
		</wp:postmeta>
		<wp:postmeta>
			<wp:meta_key><![CDATA[filmmaker_name]]></wp:meta_key>
			<wp:meta_value><![CDATA[${movie.filmmaker_name}]]></wp:meta_value>
		</wp:postmeta>
		<wp:postmeta>
			<wp:meta_key><![CDATA[_filmmaker_name]]></wp:meta_key>
			<wp:meta_value><![CDATA[field_56d16a8c82eab]]></wp:meta_value>
		</wp:postmeta>
		<wp:postmeta>
			<wp:meta_key><![CDATA[filmmaker_img]]></wp:meta_key>
			<wp:meta_value><![CDATA[]]></wp:meta_value>
		</wp:postmeta>
		<wp:postmeta>
			<wp:meta_key><![CDATA[_filmmaker_img]]></wp:meta_key>
			<wp:meta_value><![CDATA[field_56d251def7b9c]]></wp:meta_value>
		</wp:postmeta>
		<wp:postmeta>
			<wp:meta_key><![CDATA[filmmaker_bio]]></wp:meta_key>
			<wp:meta_value><![CDATA[${movie.filmmaker_bio}]]></wp:meta_value>
		</wp:postmeta>
			<wp:postmeta>
				<wp:meta_key><![CDATA[_filmmaker_bio]]></wp:meta_key>
					<wp:meta_value><![CDATA[field_56d16a9610420]]></wp:meta_value>
		</wp:postmeta>
			<wp:postmeta>
				<wp:meta_key><![CDATA[director_statement]]></wp:meta_key>
					<wp:meta_value><![CDATA[${movie.director_statement}]]></wp:meta_value>
		</wp:postmeta>
			<wp:postmeta>
				<wp:meta_key><![CDATA[_director_statement]]></wp:meta_key>
					<wp:meta_value><![CDATA[field_56da38fa47deb]]></wp:meta_value>
		</wp:postmeta>
			<wp:postmeta>
				<wp:meta_key><![CDATA[country]]></wp:meta_key>
					<wp:meta_value><![CDATA[${movie.country}]]></wp:meta_value>
		</wp:postmeta>
			<wp:postmeta>
				<wp:meta_key><![CDATA[_country]]></wp:meta_key>
					<wp:meta_value><![CDATA[field_56d20199950a6]]></wp:meta_value>
		</wp:postmeta>
			<wp:postmeta>
				<wp:meta_key><![CDATA[year]]></wp:meta_key>
					<wp:meta_value><![CDATA[${movie.year}]]></wp:meta_value>
		</wp:postmeta>
			<wp:postmeta>
				<wp:meta_key><![CDATA[_year]]></wp:meta_key>
					<wp:meta_value><![CDATA[field_56d201fc950a7]]></wp:meta_value>
		</wp:postmeta>
			<wp:postmeta>
				<wp:meta_key><![CDATA[movie_length]]></wp:meta_key>
					<wp:meta_value><![CDATA[${movie.movie_length}]]></wp:meta_value>
		</wp:postmeta>
			<wp:postmeta>
				<wp:meta_key><![CDATA[_movie_length]]></wp:meta_key>
					<wp:meta_value><![CDATA[field_56d20203950a8]]></wp:meta_value>
		</wp:postmeta>
			<wp:postmeta>
				<wp:meta_key><![CDATA[language]]></wp:meta_key>
					<wp:meta_value><![CDATA[${movie.language}]]></wp:meta_value>
		</wp:postmeta>
			<wp:postmeta>
				<wp:meta_key><![CDATA[_language]]></wp:meta_key>
					<wp:meta_value><![CDATA[field_56d38f5357cc8]]></wp:meta_value>
		</wp:postmeta>
			<wp:postmeta>
				<wp:meta_key><![CDATA[website]]></wp:meta_key>
					<wp:meta_value><![CDATA[]]></wp:meta_value>
		</wp:postmeta>
			<wp:postmeta>
				<wp:meta_key><![CDATA[_website]]></wp:meta_key>
					<wp:meta_value><![CDATA[field_56d25cc2c04ac]]></wp:meta_value>
		</wp:postmeta>
			<wp:postmeta>
				<wp:meta_key><![CDATA[production_company]]></wp:meta_key>
					<wp:meta_value><![CDATA[${movie.production_company}]]></wp:meta_value>
		</wp:postmeta>
			<wp:postmeta>
				<wp:meta_key><![CDATA[_production_company]]></wp:meta_key>
					<wp:meta_value><![CDATA[field_5b7e10c0aa690]]></wp:meta_value>
		</wp:postmeta>
		${productionStaffRepeater}
			<wp:postmeta>
				<wp:meta_key><![CDATA[disclaimer]]></wp:meta_key>
					<wp:meta_value><![CDATA[]]></wp:meta_value>
		</wp:postmeta>
			<wp:postmeta>
				<wp:meta_key><![CDATA[_disclaimer]]></wp:meta_key>
					<wp:meta_value><![CDATA[field_56d38fd257cc9]]></wp:meta_value>
		</wp:postmeta>
			<wp:postmeta>
				<wp:meta_key><![CDATA[_yoast_wpseo_primary_category]]></wp:meta_key>
					<wp:meta_value><![CDATA[28]]></wp:meta_value>
		</wp:postmeta>
			<wp:postmeta>
				<wp:meta_key><![CDATA[_yoast_wpseo_content_score]]></wp:meta_key>
					<wp:meta_value><![CDATA[30]]></wp:meta_value>
		</wp:postmeta>
	</item > `;
		postId++;
		xmlContent += `${template}\n`;
	}

	xmlContent += end;

	// clear contents of file
	fs.writeFile(finalXMLFile, xmlContent, function (err) {
		if (err) console.log(err);
	});
});