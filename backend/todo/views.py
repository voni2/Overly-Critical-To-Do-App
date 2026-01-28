from django.shortcuts import render

# import view sets from the REST framework
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .services.openai_service import generate_diss
# import the TodoSerializer from the serializer file
from .serializer import TodoSerializer
# import the Todo model from the models file
from .models import Todo

# create a class for the Todo model viewsets
class TodoView(viewsets.ModelViewSet):
    # create a serializer class and 
    # assign it to the TodoSerializer class
    serializer_class = TodoSerializer
    queryset = Todo.objects.all()
    # define a variable and populate it 
    # with the Todo list objects


@api_view(["POST"])
def diss_user(request):
    diss = generate_diss()
    return Response({"message": diss})