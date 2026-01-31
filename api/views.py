from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import DueItem, Message, ActionItem, Donor
from .serializers import DueItemSerializer, MessageSerializer, ActionItemSerializer, DonorSerializer
import uuid

USERS = {
    'admin': {'password': 'IAberk26', 'role': 'admin', 'displayName': 'Admin User'},
    'president': {'password': 'IAberk26', 'role': 'president', 'displayName': 'Jim Lucchese'},
    'vp': {'password': 'IAberk26', 'role': 'vice_president', 'displayName': 'Edward J. Lewis, III'},
    'staff': {'password': 'IAberk26', 'role': 'staff', 'displayName': 'Staff Member'},
}


def get_session_role(request):
    return request.session.get('role')


def can_view_donors(role):
    return role in ['admin', 'president', 'vice_president']


def can_edit_donors(role):
    return role == 'admin'


@csrf_exempt
@api_view(['POST'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = USERS.get(username)
    if user and user['password'] == password:
        request.session['username'] = username
        request.session['role'] = user['role']
        request.session['displayName'] = user['displayName']
        return Response({
            'success': True,
            'role': user['role'],
            'displayName': user['displayName']
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
def auth_check_view(request):
    if request.session.get('username'):
        return Response({
            'authenticated': True,
            'role': request.session.get('role'),
            'displayName': request.session.get('displayName')
        })
    return Response({'authenticated': False}, status=status.HTTP_401_UNAUTHORIZED)


@csrf_exempt
@api_view(['POST'])
def logout_view(request):
    request.session.flush()
    return Response({'success': True})


@api_view(['GET', 'POST'])
def due_items_view(request):
    if request.method == 'GET':
        items = DueItem.objects.all()
        serializer = DueItemSerializer(items, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = DueItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(id=str(uuid.uuid4()))
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH', 'DELETE'])
def due_item_detail_view(request, pk):
    try:
        item = DueItem.objects.get(pk=pk)
    except DueItem.DoesNotExist:
        return Response({'error': 'Due item not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'PATCH':
        serializer = DueItemSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        item.delete()
        return Response({'success': True})


@api_view(['GET', 'POST'])
def messages_view(request):
    if request.method == 'GET':
        msgs = Message.objects.all()
        serializer = MessageSerializer(msgs, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = MessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(id=str(uuid.uuid4()))
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
def action_items_view(request):
    if request.method == 'GET':
        items = ActionItem.objects.all()
        serializer = ActionItemSerializer(items, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = ActionItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
def action_item_done_view(request, pk):
    try:
        item = ActionItem.objects.get(pk=pk)
    except ActionItem.DoesNotExist:
        return Response({'error': 'Action item not found'}, status=status.HTTP_404_NOT_FOUND)
    
    is_done = request.data.get('isDone', 0)
    item.is_done = 1 if is_done else 0
    item.save()
    serializer = ActionItemSerializer(item)
    return Response(serializer.data)


@api_view(['GET', 'POST'])
def donors_view(request):
    role = get_session_role(request)
    
    if request.method == 'GET':
        if not can_view_donors(role):
            return Response(
                {'error': 'Access denied. Donor data is restricted to authorized personnel only.'},
                status=status.HTTP_403_FORBIDDEN
            )
        donors = Donor.objects.all()
        serializer = DonorSerializer(donors, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        if not can_edit_donors(role):
            return Response(
                {'error': 'Access denied. Only administrators can create donor records.'},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = DonorSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(id=str(uuid.uuid4()))
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH', 'DELETE'])
def donor_detail_view(request, pk):
    role = get_session_role(request)
    
    if not can_edit_donors(role):
        return Response(
            {'error': 'Access denied. Only administrators can modify donor records.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        donor = Donor.objects.get(pk=pk)
    except Donor.DoesNotExist:
        return Response({'error': 'Donor not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'PATCH':
        serializer = DonorSerializer(donor, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        donor.delete()
        return Response({'success': True})
