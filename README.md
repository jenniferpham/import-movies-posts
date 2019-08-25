Convert .csv file of movies to .xml file to import into Wordpress

See example of what XML file of movies to import looks like:
WORDPRESS WP-ADMIN > Tools > Export > Movies (custom post type) -> xml file format

add categories in Wordpress that match genre

Get movies.csv file
Download Google sheet and save as csv file and clean up data (split Production info to DIrector, Country Runtime minutes)

Prepare/Clean CSV File:
rename column names to match the custom field names
split production info into director, year, runtime(movie_length) and remove "min"
change Language to match dropdown
prep photos to match movie name
categories split by comma and one space (no new lines)
fix production staff names to have commas instead of newlines or &s
fix Additional Credits to have parentheses with job title

Import XML file that is created
Wordpress WP-Admin > Tools > Import > ./response/movies-posts-new.xml
