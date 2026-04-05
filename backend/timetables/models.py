from django.db import models
from django.core.exceptions import ValidationError
from django.db.models import Q



class Subject(models.Model):
    YEAR_CHOICES = [
        ("FE", "First Year"),
        ("SE", "Second Year"),
        ("TE", "Third Year"),
        ("BE", "Final Year"),
    ]

    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    branch = models.CharField(max_length=100)
    year = models.CharField(max_length=10, choices=YEAR_CHOICES)

    teacher = models.ForeignKey(
        "profiles.StaffProfile",
        on_delete=models.CASCADE
    )

    classroom = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.code} - {self.name}"


class TimeSlot(models.Model):
    start_time = models.TimeField()
    end_time = models.TimeField()

    is_break = models.BooleanField(default=False)
    break_label = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Example: Lunch Break, Short Break"
    )

    def __str__(self):
        if self.is_break:
            return f"{self.break_label} ({self.start_time}-{self.end_time})"
        return f"{self.start_time} - {self.end_time}"
    
    def clean(self):
        from django.core.exceptions import ValidationError

        if self.is_break and not self.break_label:
            raise ValidationError("Break label is required when is_break is True.")

    class Meta:
        unique_together = ("start_time", "end_time")



class Timetable(models.Model):

    DAY_CHOICES = [
        ("MON", "Monday"),
        ("TUE", "Tuesday"),
        ("WED", "Wednesday"),
        ("THU", "Thursday"),
        ("FRI", "Friday"),
        ("SAT", "Saturday"),
    ]

    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="timetable_entries"
    )

    timeslot = models.ForeignKey(
        TimeSlot,
        on_delete=models.CASCADE,
        related_name="timetable_entries"
    )

    day = models.CharField(max_length=3, choices=DAY_CHOICES)

    def clean(self):

        if self.timeslot.is_break and self.subject:
            raise ValidationError("Break slot cannot have subject assigned.")

        if self.subject:
            teacher = self.subject.teacher

            clash = Timetable.objects.filter(
                day=self.day,
                timeslot=self.timeslot,
                subject__teacher=teacher
            ).exclude(pk=self.pk)

            if clash.exists():
                raise ValidationError("Teacher already assigned in another class at this time.")

    def __str__(self):
        return f"{self.get_day_display()} | {self.timeslot}"

    class Meta:
        constraints = [

            # Prevent same class having two lectures same time
            models.UniqueConstraint(
                fields=["subject", "day", "timeslot"],
                name="unique_subject_timeslot"
            ),

            # Prevent teacher clash
            models.UniqueConstraint(
                fields=["day", "timeslot", "subject"],
                name="unique_teacher_per_timeslot"
            ),
        ]