This is Trip-tip, an application that makes your travel easier!


MOTIVATION

There are a lot of apps that help you have more enjoyable travelling experience, some of them create guides,
some of them have premade itineraries depending on your destination, etc. Trip-tip is my attempt to recreate something similar,
using HTML, CSS, JavaScript and combination of 3 APIs (Leaflet, Geoapify and Pexels). I wanted to do something on my own for the
final project after learning "holy trio of languages" of web-development. My ultimate goal was to display certain results on
the map, based on the user's wishes of what they want to see and where they want to travel.


QUICK DESCRIPTION OF THE CODE AND USAGE

Code used in the application is OOP-oriented. I created different classes for the map, form and the results, that interact with
each other through global variables. Class Results has 2 instances, Attractions and Restaurants, which have different methods
based on the user's selection. For the API calls, I mainly used async/await and combined the results to be visible through
HTML code manipulation. Moving through the map, deleting markers and changing forms are all results of CSS classes manipulation.


QUICK START

The site is accessible through GitHub, or through the link: https://trip-tip.netlify.app/
I had to limit the results displayed at 10, because unfortunately Pexels only allows 200 requests in an hour, which is relatively
low.
