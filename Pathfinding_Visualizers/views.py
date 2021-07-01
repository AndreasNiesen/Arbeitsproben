from django.shortcuts import render

def visualizers(request):
    return render(request, "arbeitsprobe/visualizers.html")