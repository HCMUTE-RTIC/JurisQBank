function AdminRoleCheck(role: string = "admin") {
    // return role == "admin" ? true : false
    return false
}

export function AdminDashboard() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Welcome, Admin!</h1>
            <p>Welcome to the admin dashboard. Here you can manage the application.</p>
        </div>
    )
}