import os
import jinja2
import webapp2

jinja_environment = jinja2.Environment(autoescape=True,
    loader=jinja2.FileSystemLoader(os.path.join(os.path.dirname(__file__), 'templates')))

class MainPage(webapp2.RequestHandler):
    def get(self):
        template = jinja_environment.get_template('index.html')
        self.response.out.write(template.render())

class Image(webapp2.RequestHandler):
    def get(self):
        template = jinja_environment.get_template('image.html')
        self.response.out.write(template.render())
      
app = webapp2.WSGIApplication([
    ('/', MainPage),
    ('/image', Image),
], debug=True)