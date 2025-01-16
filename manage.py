#!/usr/bin/env python
import os
import sys
from django.core.exceptions import ImproperlyConfigured

def main():
    try:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.setting')  # Updated here
        from django.core.management import execute_from_command_line
        execute_from_command_line(sys.argv)
    except ImproperlyConfigured as e:
        print(f"Configuration Error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Startup Error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
