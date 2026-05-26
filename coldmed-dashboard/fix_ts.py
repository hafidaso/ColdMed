import os

def replace_in_file(path, old, new):
    with open(path, 'r') as f:
        content = f.read()
    with open(path, 'w') as f:
        f.write(content.replace(old, new))

# 1. DataContext.tsx
replace_in_file('src/context/DataContext.tsx', 
    "import { BatchData, KpiData, LotsAValider, fetchBatches, fetchKpis, validateData } from '../services/dataService';", 
    "import { fetchBatches, fetchKpis, validateData } from '../services/dataService';\nimport type { BatchData, KpiData } from '../services/dataService';")

# 2. BatchDetail.tsx - add XOctagon
replace_in_file('src/pages/BatchDetail.tsx', 
    "AlertTriangle, ShieldAlert, CheckCircle, Clock", 
    "AlertTriangle, ShieldAlert, CheckCircle, Clock, XOctagon")

# 3. BatchSurveillance.tsx - remove Filter, ArrowUpDown
replace_in_file('src/pages/BatchSurveillance.tsx', 
    "import { Search, Filter, ArrowUpDown } from 'lucide-react';", 
    "import { Search } from 'lucide-react';")

# 4. DashboardOverview.tsx - add ShieldAlert
replace_in_file('src/pages/DashboardOverview.tsx', 
    "import { \n  Package, CheckCircle, XOctagon, AlertTriangle, \n  Clock, ThermometerSun, AlertCircle, ChevronRight \n} from 'lucide-react';",
    "import { \n  Package, CheckCircle, XOctagon, AlertTriangle, \n  Clock, ThermometerSun, AlertCircle, ChevronRight, ShieldAlert \n} from 'lucide-react';")

# 5. IoTExtension.tsx - add ThermometerSun
replace_in_file('src/pages/IoTExtension.tsx', 
    "import { Cpu, Wifi, Database, LayoutDashboard, ArrowRight, Activity, Battery, MapPin, DoorOpen } from 'lucide-react';",
    "import { Cpu, Wifi, Database, LayoutDashboard, ArrowRight, Activity, Battery, MapPin, DoorOpen, ThermometerSun } from 'lucide-react';")

# 6. LogisticsTraceability.tsx - remove BatchData
replace_in_file('src/pages/LogisticsTraceability.tsx', 
    "import { BatchData } from '../services/dataService';\n",
    "")

# 7. QualityReview.tsx - change to type import
replace_in_file('src/pages/QualityReview.tsx', 
    "import { BatchData } from '../services/dataService';",
    "import type { BatchData } from '../services/dataService';")

print("Fixed TS errors")
