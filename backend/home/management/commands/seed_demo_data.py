# home/management/commands/seed_demo_data.py
import json
from django.core.management.base import BaseCommand
from home.services.demo_seeder import reset_and_seed_demo_data


class Command(BaseCommand):
    help = "Resets user-created demo data and re-seeds clean baseline data for user demo evaluations."

    def add_arguments(self, parser):
        parser.add_argument(
            "--source",
            type=str,
            default="command",
            help="Trigger source identifier (e.g. cron, command, deploy)",
        )

    def handle(self, *args, **options):
        source = options.get("source", "command")
        self.stdout.write(self.style.NOTICE(f"Starting NeoCampus demo database reset and seed (source: {source})..."))

        try:
            result = reset_and_seed_demo_data(triggered_by=source)
            self.stdout.write(self.style.SUCCESS("Demo database successfully reset and seeded!"))
            self.stdout.write(self.style.SUCCESS(f"Total records seeded: {result.get('records_seeded')}"))
            self.stdout.write(json.dumps(result.get("breakdown", {}), indent=2))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error resetting demo database: {str(e)}"))
            raise e
