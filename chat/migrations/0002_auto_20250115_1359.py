# Generated by Django 3.1.12 on 2025-01-15 13:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0001_initial'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Message',
            new_name='ChatMessage',
        ),
        migrations.RemoveIndex(
            model_name='chatmessage',
            name='chat_messag_sender__53da58_idx',
        ),
        migrations.AddIndex(
            model_name='chatmessage',
            index=models.Index(fields=['sender', 'receiver', 'timestamp'], name='chat_chatme_sender__f1d558_idx'),
        ),
    ]
