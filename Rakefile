task default: %w[jade css]

task :jade do
  sh "jade index.jade -P index.html"
end

task :css do
  sh "sass scss/main.scss css/main.css"
end
