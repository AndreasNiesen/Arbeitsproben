from django.db import models


class Author(models.Model):
  name = models.CharField(max_length=100)

class Book(models.Model):
  name = models.CharField(max_length=200)  # 200 chars should be more than enough for the title/name of a book
  author = models.ManyToManyField(Author)  # in case I'll implement a search for author
  seriesName = models.CharField(max_length=200, blank=True, null=True)  # empty/null if standalone
  cover = models.ImageField(upload_to='covers')  # photo of the books cover
  desc_de = models.TextField(blank=True, null=True)  # the books quick-summary in german
  desc_en = models.TextField(blank=True, null=True)  # and english