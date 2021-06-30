#!/bin/bash

vnstati -s -i eth0 -o /var/www/img/vnstati-sum.png
vnstati -m -i eth0 -o /var/www/img/vnstati-month.png
vnstati -d -i eth0 -o /var/www/img/vnstati-day.png
vnstati -h -i eth0 -o /var/www/img/vnstati-hour.png
