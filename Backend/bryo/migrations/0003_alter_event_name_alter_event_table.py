# Generated by Django 5.2 on 2025-06-16 13:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bryo', '0002_event_slug'),
    ]

    operations = [
        migrations.AlterField(
            model_name='event',
            name='name',
            field=models.CharField(max_length=100),
        ),
        migrations.AlterModelTable(
            name='event',
            table='bryo_event',
        ),
    ]
