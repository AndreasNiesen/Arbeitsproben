from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, JsonResponse
from .models import Author as AuthorModel, Book as BookModel


def bookCollection(request):
    return render(request, "bookCollection/bookCollection.html")

@csrf_exempt
def authorEndpoint(request):
    if not request.method == "POST": return HttpResponse("Error: POST-Requests only!")
    
    request_body = str(request.body)[2:-1].split("=")  # entferne "b'" vom Start des Strings und "'" vom Ende
    if len(request_body) < 2: return HttpResponse("Error: Bad POST-Body!")
    
    parameter = request_body[0]  # nur das erste Paar wird beachtet, der rest wird dropped
    name = request_body[1]
    if parameter.lower() != "author": return HttpResponse("Error: Bad Parameter!")
    
    response = AuthorModel.objects.filter(name__icontains=name)
    return JsonResponse(list(response.values()), safe=False)

@csrf_exempt
def bookEndpoint(request):
    if not request.method == "POST": return HttpResponse("Error: POST-Requests only!")
    
    fields = ["name", "author", "seriesName", "desc_de", "desc_en"]
    request_body = str(request.body)[2:-1]  # entferne "b'" vom Start des Strings und "'" vom Ende
    filters = request_body.split(";")
    if len(filters) < 1: return HttpResponse("Error: No Parameters given!")
    
    result = BookModel.objects.all()
    for f in filters:
        f_split = f.split("=")
        if len(f_split) != 2: return HttpResponse("Error: Bad POST-Body!")
        if f_split[0].lower() not in fields: return HttpResponse("Error: Bad Parameter!")
        
        search_string = f_split[0]
        if (search_string == "author"): search_string += "__name"
        search_string += "__icontains"
        result = result.filter(**{search_string: f_split[1]})
        
    response = list(result.values())
    for i, book in enumerate(result):
        authors = ", ".join(author.name for author in book.author.all())
        response[i]["author"] = authors
        
    return JsonResponse(response, safe=False)