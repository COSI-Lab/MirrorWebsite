task default: %w[jade css]

task :jade do
  sh "jade index.jade -P index.html"
  sh "jade distributions.jade -P distributions.html"
end

task :css do
  sh "sass scss/main.scss css/main.css"
end
