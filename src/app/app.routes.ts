import { Routes } from "@angular/router";
import { ProductsPageComponent } from "./pages/products-page/products-page.component";
import { AuthPageComponent } from "./pages/auth-page/auth-page.component";
import { OrderPageComponent } from "./pages/order-page/order-page.component";
import { PaymentPageComponent } from "./pages/payment-page/payment-page.component";
import { AdminProductsPageComponent } from "./pages/admin/admin-products-page/admin-products-page.component";
import { AdminOrdersPageComponent } from "./pages/admin/admin-orders-page/admin-orders-page.component";
import { hasRoleGuard } from "./has-role.guard";
import { Role } from "./roles";
import { AdminOrderDetailsPageComponent } from "./pages/admin/admin-order-details-page/admin-order-details-page.component";
import { AdminProductDetailsPageComponent } from "./pages/admin-product-details-page/admin-product-details-page.component";
import { AdminCustomersPageComponent } from "./pages/admin-customers-page/admin-customers-page.component";
import { AdminDashboardPageComponent } from "./pages/admin-dashboard-page/admin-dashboard-page.component";

export const routes: Routes = [
	{ path: "", redirectTo: "products", pathMatch: "full" },
	{
		path: "products",
		component: ProductsPageComponent,
	},
	{
		path: "auth",
		component: AuthPageComponent,
	},
	{
		path: "order/:productId",
		component: OrderPageComponent,
	},
	{
		path: "order/payment/success",
		component: PaymentPageComponent,
	},
	{
		path: "admin/dashboard",
		canActivate: [hasRoleGuard],
		data: {
			roles: [Role.USER],
		},
		component: AdminDashboardPageComponent,
	},
	{
		path: "admin/products",
		canActivate: [hasRoleGuard],
		data: {
			roles: [Role.USER],
		},
		component: AdminProductsPageComponent,
	},
	{
		path: "admin/orders",
		canActivate: [hasRoleGuard],
		data: {
			roles: [Role.USER],
		},
		component: AdminOrdersPageComponent,
	},
	{
		path: "admin/customers",
		canActivate: [hasRoleGuard],
		data: {
			roles: [Role.USER],
		},
		component: AdminCustomersPageComponent,
	},
	{
		path: "admin/orders/:id",
		canActivate: [hasRoleGuard],
		data: {
			roles: [Role.USER],
		},
		component: AdminOrderDetailsPageComponent,
	},
	{
		path: "admin/products/:id",
		canActivate: [hasRoleGuard],
		data: {
			roles: [Role.USER],
		},
		component: AdminProductDetailsPageComponent,
	},
];
