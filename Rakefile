# To be removed in place of Gulp

task default: %w[jade css]

task :jade do
  sh "jade index.jade -P index.html"
  sh "jade distributions.jade -P distributions.html"
  sh "jade 3rdparty.jade -P 3rdparty.html"
  sh "jade misc.jade -P misc.html"
  sh "jade directory.jade -P directory.html"
  sh "jade history.jade -P history.html"
end

task :css do
  sh "sass scss/main.scss css/main.css"
end
