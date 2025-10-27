const { createApp } = Vue;

createApp({
    data() {
        return {
            appTitle: 'Proteus Monitor',
            pageTitle: 'System Dashboard',
            
            // Statistics data
            stats: [
                { label: 'Active Services', value: 12, status: 'good' },
                { label: 'CPU Usage', value: '45%', status: 'good' },
                { label: 'Memory Usage', value: '67%', status: 'warning' },
                { label: 'Disk Space', value: '23%', status: 'good' }
            ],
            
            // Task management
            tasks: [
                { id: 1, text: 'Review system logs', completed: false },
                { id: 2, text: 'Update security patches', completed: true },
                { id: 3, text: 'Backup database', completed: false }
            ],
            newTask: '',
            nextTaskId: 4,
            
            // System status
            systemOnline: true,
            systemLoad: 45,
            statusMessage: 'All systems operational',
            
            // User profile
            user: {
                name: '',
                email: '',
                role: ''
            },
            profileMessage: ''
        };
    },
    computed: {
        alertClass() {
            return this.systemOnline ? '-success' : '-danger';
        },
        alertIcon() {
            return this.systemOnline ? 'icon-circle-check' : 'icon-circle-warning-outline';
        }
    },
    methods: {
        addTask() {
            if (this.newTask.trim()) {
                this.tasks.push({
                    id: this.nextTaskId++,
                    text: this.newTask.trim(),
                    completed: false
                });
                this.newTask = '';
            }
        },
        
        removeTask(index) {
            this.tasks.splice(index, 1);
        },
        
        refreshData() {
            // Simulate data refresh
            this.systemLoad = Math.floor(Math.random() * 100);
            this.stats[1].value = this.systemLoad + '%';
            this.stats[1].status = this.systemLoad > 80 ? 'danger' : this.systemLoad > 60 ? 'warning' : 'good';
            
            this.statusMessage = this.systemOnline ? 
                'System refreshed at ' + new Date().toLocaleTimeString() : 
                'System is currently offline';
        },
        
        simulateLoad() {
            // Simulate system load increase
            this.systemLoad = Math.min(100, this.systemLoad + Math.floor(Math.random() * 30));
            this.stats[1].value = this.systemLoad + '%';
            this.stats[1].status = this.systemLoad > 80 ? 'danger' : this.systemLoad > 60 ? 'warning' : 'good';
        },
        
        resetSystem() {
            this.systemLoad = 20;
            this.stats[1].value = '20%';
            this.stats[1].status = 'good';
            this.statusMessage = 'System reset completed';
        },
        
        saveProfile() {
            if (this.user.name && this.user.email) {
                this.profileMessage = `Profile saved for ${this.user.name}`;
                setTimeout(() => {
                    this.profileMessage = '';
                }, 3000);
            }
        }
    },
    
    watch: {
        systemOnline(newValue) {
            this.statusMessage = newValue ? 
                'System is now online and operational' : 
                'System has been taken offline for maintenance';
        }
    },
    
    mounted() {
        // Simulate periodic updates
        setInterval(() => {
            if (this.systemOnline) {
                // Small random fluctuations in system load
                const change = (Math.random() - 0.5) * 10;
                this.systemLoad = Math.max(0, Math.min(100, this.systemLoad + change));
                this.stats[1].value = Math.floor(this.systemLoad) + '%';
                this.stats[1].status = this.systemLoad > 80 ? 'danger' : this.systemLoad > 60 ? 'warning' : 'good';
            }
        }, 5000);
    }
}).mount('#app');