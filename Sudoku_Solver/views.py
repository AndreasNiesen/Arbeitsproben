from django.shortcuts import render


def sudoku_solver(request):
    return render(request, "arbeitsprobe/sudokusolver.html")