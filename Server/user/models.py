
from django.db import models


class DeletedUsers(models.Model):
    user_id = models.CharField(max_length=30, blank=True, null=True)
    username = models.CharField(max_length=50, blank=True, null=True)
    email = models.CharField(max_length=100, blank=True, null=True)
    role = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'deleted_users'


class User(models.Model):
    user_id = models.CharField(primary_key=True, max_length=30)
    username = models.CharField(unique=True, max_length=50, blank=True, null=True)
    email = models.CharField(unique=True, max_length=100, blank=True, null=True)
    password = models.CharField(max_length=100, blank=True, null=True)
    role = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'user'
