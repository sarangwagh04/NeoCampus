# accounts/admin.py
from django.contrib import admin, messages
from django.template.response import TemplateResponse
from django.urls import path
from django.shortcuts import redirect
import pandas as pd
from django.http import HttpResponse

from .models import DummyStudentModel, DummyStaffModel
from .forms import ExcelUploadForm
from .views import (
    create_students_from_excel,
    create_staff_from_excel,
    staff_template,
    student_template
)

# ---------- Base Upload Admin ----------
class BaseUploadAdmin(admin.ModelAdmin):
    upload_function = None
    template_function = None   # NEW
    section_title = ""
    upload_name = ""
    template_name = "admin/upload_excel.html"

    def get_urls(self):
        urls = super().get_urls()
        extra_urls = [
            path(
                "upload-excel/",
                self.admin_site.admin_view(self.upload_excel),
                name=self.upload_name,
            ),
            path(
                "download-template/",
                self.admin_site.admin_view(self.download_template),
                name=f"{self.upload_name}_template",
            ),
        ]
        return extra_urls + urls

    def changelist_view(self, request, extra_context=None):
        return redirect(f"admin:{self.upload_name}")

    def upload_excel(self, request):
        if request.method == "POST":
            form = ExcelUploadForm(request.POST, request.FILES)
            if form.is_valid():
                try:
                    df = pd.read_excel(form.cleaned_data["excel_file"])
                    created, updated, errors = self.upload_function(df)

                    messages.success(request, f"✅ {created} records created.")
                    if updated:
                        messages.info(request, f"♻️ {updated} records updated.")
                    for e in errors:
                        messages.warning(request, e)

                    return redirect("..")
                except Exception as e:
                    messages.error(request, f"Error: {e}")
                    return redirect("..")
        else:
            form = ExcelUploadForm()

        context = {
            **self.admin_site.each_context(request),
            "form": form,
            "title": self.section_title,
            "template_download_url": f"admin:{self.upload_name}_template",
        }
        return TemplateResponse(request, self.template_name, context)
    
    def download_template(self, request):
        df = self.template_function()

        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response["Content-Disposition"] = f'attachment; filename="{self.upload_name}_template.xlsx"'

        df.to_excel(response, index=False)

        return response


# ---------- Final Admin Registration ----------
class StudentUploadAdmin(BaseUploadAdmin):
    upload_function = staticmethod(create_students_from_excel)
    template_function = staticmethod(student_template)
    section_title = "Upload Students Excel"
    upload_name = "upload_students_excel"


class StaffUploadAdmin(BaseUploadAdmin):
    upload_function = staticmethod(create_staff_from_excel)
    template_function = staticmethod(staff_template)
    section_title = "Upload Staff Excel"
    upload_name = "upload_staff_excel"


admin.site.register(DummyStudentModel, StudentUploadAdmin)
admin.site.register(DummyStaffModel, StaffUploadAdmin)
