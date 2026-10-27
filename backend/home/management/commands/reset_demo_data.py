# home/management/commands/reset_demo_data.py
from django.core.management.base import BaseCommand
from home.management.commands.seed_demo_data import Command as SeedCommand


class Command(SeedCommand):
    help = "Alias command for seed_demo_data to reset ephemeral demo records."
