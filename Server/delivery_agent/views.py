from django.http import JsonResponse
from django.db import connection, DatabaseError

def delivery_agent_orders(request, agent_id):
    """Fetch order statistics for a delivery agent, optionally filtered by status"""
    status_name = request.GET.get("status_name")  # optional filter
    
    with connection.cursor() as cursor:
        try:
            # Convert agent_id to integer
            agent_id_int = int(agent_id)
            
            # Create output variables
            p_order_count = cursor.var(int)
            p_total_amount = cursor.var(float)
            p_avg_items = cursor.var(float)
            
            # Use raw SQL call
            sql = """
            BEGIN
                get_delivery_agent_orders(
                    p_agent_id => :agent_id,
                    p_status_name => :status_name,
                    p_order_count => :order_count,
                    p_total_amount => :total_amount,
                    p_avg_items => :avg_items
                );
            END;
            """
            
            # Execute the procedure
            cursor.execute(sql, {
                'agent_id': agent_id_int,
                'status_name': status_name,
                'order_count': p_order_count,
                'total_amount': p_total_amount,
                'avg_items': p_avg_items
            })
            
            # Get the results
            result = {
                "order_count": p_order_count.getvalue() or 0,
                "total_amount": float(p_total_amount.getvalue() or 0),
                "avg_items_per_order": float(p_avg_items.getvalue() or 0)
            }
                
        except ValueError:
            return JsonResponse({"error": "Invalid agent ID"}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"Database error: {str(e)}"}, status=500)
    
    return JsonResponse({"order_stats": result})

def delivery_agent_stats(request, agent_id):
    with connection.cursor() as cursor:
        try:
            # Use raw SQL with bind variables
            sql = """
            BEGIN
                get_delivery_agent_stats(
                    p_agent_id => :agent_id,
                    p_completed_deliveries => :completed,
                    p_pending_deliveries => :pending,
                    p_total_earnings => :earnings
                );
            END;
            """
            
            # Create output variables
            out_completed = cursor.var(int)
            out_pending = cursor.var(int)
            out_earnings = cursor.var(float)
            
            # Execute with bind variables
            cursor.execute(sql, {
                'agent_id': agent_id,
                'completed': out_completed,
                'pending': out_pending,
                'earnings': out_earnings
            })
            
            result = {
                "completed_deliveries": out_completed.getvalue(),
                "pending_deliveries": out_pending.getvalue(),
                "total_earnings": out_earnings.getvalue()
            }
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"stats": result})