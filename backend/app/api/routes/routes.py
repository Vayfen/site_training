from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ...core.database import get_db
from ...api.deps import get_current_user
from ...models import User, Route
from ...schemas import RouteCreate, RouteResponse, GenerateRouteRequest
from ...services import RouteFinderService

router = APIRouter()


@router.get("", response_model=List[RouteResponse])
def list_routes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    favorites_only: bool = False,
):
    """List user's routes"""

    query = db.query(Route).filter(Route.user_id == current_user.id)

    if favorites_only:
        query = query.filter(Route.is_favorite == True)

    routes = query.order_by(Route.created_at.desc()).offset(skip).limit(limit).all()

    return routes


@router.post("/generate", response_model=RouteResponse, status_code=status.HTTP_201_CREATED)
def generate_route(
    request: GenerateRouteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate a route using AI"""

    route_service = RouteFinderService()

    try:
        route = route_service.generate_route(
            db=db,
            user=current_user,
            distance_km=request.distance_km,
            route_type=request.route_type,
            start_location=request.start_location,
            start_lat=request.start_lat,
            start_lng=request.start_lng,
            elevation_preference=request.elevation_preference,
            loop=request.loop,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate route: {str(e)}",
        )

    return route


@router.post("", response_model=RouteResponse, status_code=status.HTTP_201_CREATED)
def create_route(
    route_data: RouteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a manual route"""

    route = Route(
        user_id=current_user.id,
        **route_data.dict(),
    )

    db.add(route)
    db.commit()
    db.refresh(route)

    return route


@router.get("/{route_id}", response_model=RouteResponse)
def get_route(
    route_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific route"""

    route = db.query(Route).filter(
        Route.id == route_id,
        Route.user_id == current_user.id
    ).first()

    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found",
        )

    return route


@router.post("/{route_id}/favorite", response_model=RouteResponse)
def toggle_favorite(
    route_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Toggle route favorite status"""

    route = db.query(Route).filter(
        Route.id == route_id,
        Route.user_id == current_user.id
    ).first()

    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found",
        )

    route.is_favorite = not route.is_favorite

    db.commit()
    db.refresh(route)

    return route


@router.delete("/{route_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_route(
    route_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a route"""

    route = db.query(Route).filter(
        Route.id == route_id,
        Route.user_id == current_user.id
    ).first()

    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found",
        )

    db.delete(route)
    db.commit()

    return None
